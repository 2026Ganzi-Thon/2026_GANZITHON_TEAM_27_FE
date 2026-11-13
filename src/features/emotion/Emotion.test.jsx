import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { EmotionChangeView } from './index'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const caseResponse = {
  id: 'case-1',
  status: 'decision_review',
  emotion: { type: 'anxiety', intensity: 70 },
}

const renderView = () => {
  const onNext = vi.fn()
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <EmotionChangeView caseId="case-1" onNext={onNext} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { onNext }
}

describe('EmotionChangeView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
  })

  it('Figma 문구와 초기값 40, 접수 당시 강도를 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: caseResponse })
    renderView()

    expect(screen.getByRole('heading', { name: '감정 확인' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'EMOTION CHECK' })).toBeInTheDocument()
    expect(screen.getByText('지금 감정 상태를 체크해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: '지금 감정의 강도' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(await screen.findByText('접수 당시: 70')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')
  })

  it('접수 때 감정을 입력하지 않았으면 기록 없음으로 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ...caseResponse, emotion: null } })
    renderView()
    expect(await screen.findByText('접수 당시: 기록 없음')).toBeInTheDocument()
  })

  it('접수 당시 감정을 불러오지 못하면 다시 시도할 수 있다', async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ data: caseResponse })
    renderView()

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('접수 당시: 70')).toBeInTheDocument()
  })

  it('다음을 누르면 접수 때 감정 type과 지금 강도를 넘긴다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: caseResponse })
    const { onNext } = renderView()
    await screen.findByText('접수 당시: 70')

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(onNext).toHaveBeenCalledWith({ type: 'anxiety', intensity: 100 })
  })
})
