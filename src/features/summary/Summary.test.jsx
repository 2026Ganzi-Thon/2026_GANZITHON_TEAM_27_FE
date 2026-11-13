import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { SummaryView } from './index'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const detail = {
  id: 'case-1',
  case_number: '2026-031',
  status: 'closed',
  thought: '나는 왜 자꾸 불안할까?',
  case_type: '과도한 자기비판',
  emotion: { type: 'anxiety', intensity: 80 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  decision: { type: 'reframed', final_statement: '그럴 수 있다.' },
}

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

const renderView = (props = {}) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <SummaryView caseId="case-1" confirmTo="/" makeCardTo="/card" {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('SummaryView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
  })

  it('불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}))
    renderView()
    expect(screen.getByRole('heading', { name: '사건파일 요약' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('불러오고 있어요')
    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')
  })

  it('Figma 문구 그대로 사건번호·카드·감정 변화를 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: detail })
    renderView()

    expect(await screen.findByText('사건번호 #2026-031')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '처음 든 생각' })).toBeInTheDocument()
    expect(screen.getByText('나는 왜 자꾸 불안할까?')).toBeInTheDocument()
    expect(screen.getByText('그럴 수 있다.')).toBeInTheDocument()
    expect(screen.getByText('과도한 자기비판')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '감정변화 확인' })).toBeInTheDocument()
    expect(screen.getByText('재판을 통해, 불안이 40% 줄어들었어요.')).toBeInTheDocument()
    expect(screen.getByText('재판 전 불안 80%, 재판 후 40%')).toBeInTheDocument()
  })

  it('감정을 비교할 수 없으면 그래프 대신 안내 문구를 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...detail, emotion_after: null } })
    renderView()
    expect(await screen.findByText('재판 전과 후의 감정을 비교할 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByText('재판 전')).not.toBeInTheDocument()
  })

  it('불러오지 못하면 다시 시도할 수 있고, 404면 찾을 수 없다고 보여준다', async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({ data: detail })
    renderView()
    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('사건번호 #2026-031')).toBeInTheDocument()
  })

  it('사건이 없으면(404) 다시 시도 없이 안내만 보여준다', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(httpError(404))
    renderView()
    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('확인·사건카드 만들기는 링크, 뒤로가기는 버튼이고 공유는 동작이 없으면 비활성이다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: detail })
    renderView()
    await screen.findByText('사건번호 #2026-031')

    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '사건카드 만들기' })).toHaveAttribute('href', '/card')
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '공유하기' })).toBeDisabled()
  })

  it('공유 핸들러가 있으면 공유 버튼을 누를 수 있다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: detail })
    const onShare = vi.fn()
    renderView({ onShare })
    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))
    expect(onShare).toHaveBeenCalled()
  })
})
