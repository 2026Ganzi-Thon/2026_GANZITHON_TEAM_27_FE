import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { DefenseView } from './index'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const question = { id: 'q1', sequence: 1, prompt: '최근에 칭찬 받은 적이 있습니까?', revision: 2 }

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

const renderView = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <DefenseView caseId="case-1" />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('DefenseView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { id: 'case-1', case_number: '2026-031' } })
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.put).mockReset()
  })

  it('질문을 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('heading', { name: '변론' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('질문을 준비하고 있어요')
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/defense/questions')
  })

  it('사건번호와 AI 질문 말풍선, 입력 영역을 보여준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: question })
    renderView()

    expect(await screen.findByText('최근에 칭찬 받은 적이 있습니까?')).toBeInTheDocument()
    expect(await screen.findByText('사건번호 #2026-031')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '생각법정 경찰 캐릭터' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '추천 질문' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByLabelText('답변')).toHaveAttribute('placeholder', '답변을 입력해주세요.')
    expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/')
  })

  it('답변을 보내면 최신 revision과 함께 PUT하고 입력창을 비운다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: question })
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
    renderView()

    await screen.findByText('최근에 칭찬 받은 적이 있습니까?')
    const input = screen.getByLabelText('답변')
    fireEvent.change(input, { target: { value: '  있다  ' } })
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))

    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/defense/questions/q1/answer', {
        action: 'answer',
        text: '있다',
        revision: 2,
      }),
    )
    expect(input).toHaveValue('')
  })

  it('빈 답변은 보내지 않는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: question })
    renderView()

    await screen.findByText('최근에 칭찬 받은 적이 있습니까?')
    fireEvent.change(screen.getByLabelText('답변'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))

    expect(apiClient.put).not.toHaveBeenCalled()
  })

  it('질문 요청이 입력 오류(422)면 다시 시도 버튼 없이 입력을 확인하라고 안내한다', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(httpError(422))
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('입력한 내용을 확인해 주세요.')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('답변이 입력 오류(422)면 입력을 확인하라고 안내한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: question })
    vi.mocked(apiClient.put).mockRejectedValue(httpError(422))
    renderView()

    await screen.findByText('최근에 칭찬 받은 적이 있습니까?')
    fireEvent.change(screen.getByLabelText('답변'), { target: { value: '있다' } })
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('입력한 내용을 확인해 주세요.')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('AI 오류(503)면 다시 시도 버튼을 보여주고, 누르면 질문을 다시 요청한다', async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({ data: question })
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('AI가 잠시 응답하지 못했어요')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('최근에 칭찬 받은 적이 있습니까?')).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledTimes(2)
  })
})
