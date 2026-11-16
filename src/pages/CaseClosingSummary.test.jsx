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

describe('종결 카드 → 사건요약 (맨 위 / 감정 변화 그래프)', () => {
  beforeEach(() => {
    // 사건요약은 접수 정보를 동료의 목업 저장소에서, 법정 진행 결과를 사건 상세에서 읽는다.
    localStorage.clear()
    localStorage.setItem(
      'mock-case-files',
      JSON.stringify([
        {
          id: 'case-7',
          case_number: '2026-031',
          thought: caseDetail.thought,
          emotion: caseDetail.emotion,
        },
      ]),
    )
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

  it('종결 카드 두 개는 같은 사건의 사건요약으로 가고, "감정 변화 확인"은 그래프 위치(#emotion)로 간다', async () => {
    renderAt('/cases/case-7/closing')
    await screen.findByRole('heading', { name: '사건이 종결되었습니다' })

    expect(screen.getByRole('link', { name: /사건파일 요약/ })).toHaveAttribute(
      'href',
      '/cases/case-7/summary',
    )
    expect(screen.getByRole('link', { name: /감정 변화 확인/ })).toHaveAttribute(
      'href',
      '/cases/case-7/summary#emotion',
    )
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute(
      'href',
      '/cases/case-7/summary',
    )
  })

  it('"감정 변화 확인"을 누르면 사건요약에서 감정 변화 그래프로 바로 스크롤하고 포커스한다', async () => {
    const router = renderAt('/cases/case-7/closing')
    fireEvent.click(await screen.findByRole('link', { name: /감정 변화 확인/ }))

    const chart = await screen.findByRole('region', { name: '감정변화 확인' })
    expect(router.state.location.pathname).toBe('/cases/case-7/summary')
    expect(router.state.location.hash).toBe('#emotion')
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' }))
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(chart)
    expect(chart).toHaveAttribute('id', 'emotion')
    expect(chart).toHaveFocus()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('"사건파일 요약"을 누르면 사건요약 화면 맨 위에서 시작한다', async () => {
    const router = renderAt('/cases/case-7/closing')
    fireEvent.click(await screen.findByRole('link', { name: /사건파일 요약/ }))

    await screen.findByRole('region', { name: '감정변화 확인' })
    expect(router.state.location.pathname).toBe('/cases/case-7/summary')
    expect(router.state.location.hash).toBe('')
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 0 }))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
