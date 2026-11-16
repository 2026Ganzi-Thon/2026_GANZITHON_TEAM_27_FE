import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const caseDetail = {
  id: 'case-7',
  case_number: '2026-031',
  status: 'closed',
  thought: '나는 왜 자꾸 불안할까?',
  pattern_tags: ['all_or_nothing'],
  emotion: { type: 'anxiety', intensity: 80 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  decision: { type: 'reframed', final_statement: '그럴 수 있다.' },
}

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

// jsdom에는 스크롤 함수가 없어서 호출만 기록한다.
const scrollIntoView = vi.fn()
const scrollTo = vi.fn()

describe('종결 확인 → 사건요약', () => {
  beforeEach(() => {
    // 사건요약은 사건 상세(GET /cases/{id}) 하나로 접수 정보와 법정 진행 결과를 읽는다.
    vi.mocked(apiClient.get).mockReset().mockResolvedValue({ data: caseDetail })
    scrollIntoView.mockReset()
    scrollTo.mockReset()
    Element.prototype.scrollIntoView = scrollIntoView
    Element.prototype.scrollTo = scrollTo
  })

  afterEach(() => {
    delete Element.prototype.scrollIntoView
    delete Element.prototype.scrollTo
  })

  it('"확인"을 누르면 사건요약 화면 맨 위에서 시작한다', async () => {
    const router = renderAt('/cases/case-7/closing')
    fireEvent.click(await screen.findByRole('link', { name: '확인' }))

    await screen.findByRole('region', { name: '감정변화 확인' })
    expect(router.state.location.pathname).toBe('/cases/case-7/summary')
    expect(router.state.location.hash).toBe('')
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 0 }))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
