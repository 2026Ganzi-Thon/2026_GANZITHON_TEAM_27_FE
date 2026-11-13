import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { ProsecutionView } from './index'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const draft = {
  title: '회의 발표 사건',
  claim: '피고인은 "나는 쓸모없어" 라는 생각으로\n본 법정에 기소되었습니다.',
  pattern_candidates: ['all_or_nothing', 'labeling'],
  evidence: [
    { type: 'observed', text: '실수 후 자책한 기록' },
    { type: 'interpretation', text: '타인의 무관심을 느낀 경험' },
  ],
}

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

const renderView = (props = {}) => {
  const onDefenseStart = vi.fn()
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ProsecutionView caseId="case-1" onDefenseStart={onDefenseStart} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { onDefenseStart }
}

describe('ProsecutionView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { id: 'case-1' } })
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.put).mockReset()
  })

  it('기소 초안을 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('heading', { name: '기소' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('기소장을 작성하고 있어요')
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/prosecution')
  })

  it('기소 초안의 제목·기소 문구·사고 패턴·증거를 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { id: 'case-1', case_number: '2026-000031' },
    })
    vi.mocked(apiClient.post).mockResolvedValue({ data: draft })
    renderView()

    expect(await screen.findByRole('heading', { name: '회의 발표 사건' })).toBeInTheDocument()
    expect(await screen.findByText('사건번호 #2026-000031')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')
    expect(screen.getByText(/나는 쓸모없어/)).toBeInTheDocument()
    expect(screen.getByText('흑백 논리')).toBeInTheDocument()
    expect(screen.getByText('낙인 찍기')).toBeInTheDocument()
    expect(screen.getByText('실수 후 자책한 기록')).toBeInTheDocument()
    expect(screen.getByText('타인의 무관심을 느낀 경험')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/')
  })

  it('사건번호가 없으면 사건번호 뱃지를 숨긴다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draft })
    renderView()

    await screen.findByRole('heading', { name: '회의 발표 사건' })
    expect(screen.queryByText(/사건번호/)).not.toBeInTheDocument()
  })

  it('AI 오류(503)면 안내와 다시 시도 버튼을 보여주고, 다시 시도하면 초안을 다시 요청한다', async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({ data: draft })
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('AI가 잠시 응답하지 못했어요')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('heading', { name: '회의 발표 사건' })).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledTimes(2)
  })

  it('입력 오류(422)면 다시 시도 버튼 없이 입력을 확인하라고 안내한다', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(httpError(422))
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('입력한 내용을 확인해 주세요.')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledTimes(1)
  })

  it('사건이 없으면(404) 다시 시도 버튼 없이 안내만 보여준다', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(httpError(404))
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('사건을 찾을 수 없어요.')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('변론 시작을 누르면 초안을 증거로 확정하고 성공 핸들러를 호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draft })
    vi.mocked(apiClient.put).mockResolvedValue({ data: { status: 'defense' } })
    const { onDefenseStart } = renderView()

    fireEvent.click(await screen.findByRole('button', { name: '변론 시작' }))

    await waitFor(() => expect(onDefenseStart).toHaveBeenCalledTimes(1))
    expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/evidence', {
      claim: draft.claim,
      pattern_tags: ['all_or_nothing', 'labeling'],
      evidence: draft.evidence,
    })
  })

  it('증거 확정에 실패하면 오류를 보여주고 이동하지 않는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draft })
    vi.mocked(apiClient.put).mockRejectedValue(httpError(502))
    const { onDefenseStart } = renderView()

    fireEvent.click(await screen.findByRole('button', { name: '변론 시작' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('AI가 잠시 응답하지 못했어요')
    expect(onDefenseStart).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '변론 시작' })).toBeEnabled()
  })
})
