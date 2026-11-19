import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

/** `GET /cases`가 돌려줄 사건 하나를 만든다. */
const makeCase = (overrides = {}) => ({
  id: 'case-1',
  title: null,
  thought: '발표가 걱정돼요',
  emotion: { type: 'anxiety', intensity: 70 },
  emotion_after: null,
  status: 'received',
  created_at: '2026-11-16T00:00:00Z',
  ...overrides,
})

/** 서버의 사건 목록을 정한다(최근 사건이 먼저 온다). 사건 목록이 아닌 요청은 응답을 기다리게 둔다. */
const serveCases = (items) => {
  vi.mocked(apiClient.get).mockImplementation((url) =>
    url === '/cases'
      ? Promise.resolve({ data: { items: [...items], next_cursor: null } })
      : new Promise(() => {}),
  )
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

beforeEach(() => {
  localStorage.clear()
  // 이동한 화면이 서버를 부르더라도 응답을 기다리게 두어서 이동만 확인한다.
  vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}))
  vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {}))
  vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })
})

describe('홈의 이어하기 카드', () => {
  it.each([
    ['received', '/cases/case-1/prosecution'],
    ['evidence_review', '/cases/case-1/prosecution'],
    ['defense', '/cases/case-1/defense'],
    ['decision_review', '/cases/case-1/decision'],
  ])('상태가 %s이면 %s로 이어간다', async (status, expectedPath) => {
    serveCases([makeCase({ status })])
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /이어하기/ }))

    expect(router.state.location.pathname).toBe(expectedPath)
  })

  it('종결된 사건 카드는 사건요약으로 간다', async () => {
    serveCases([makeCase({ status: 'closed', title: '끝난 사건' })])
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /끝난 사건.*감정 변화/ }))

    expect(router.state.location.pathname).toBe('/cases/case-1/summary')
  })
})

describe('사건 목록의 사건 카드', () => {
  it('진행 중인 사건은 진행 상태에 맞는 화면으로 간다', async () => {
    serveCases([makeCase({ status: 'decision_review', title: '진행 중 사건' })])
    const router = renderAt('/court')

    fireEvent.click(await screen.findByRole('button', { name: /진행 중 사건.*감정 변화/ }))

    expect(router.state.location.pathname).toBe('/cases/case-1/decision')
  })
})

describe('홈의 재방문 모습과 삭제', () => {
  /** 최근 사건이 먼저 오는 종결 사건 여러 개. */
  const closedCases = () =>
    [
      ['c3', '셋째 사건', '2026-11-16T00:00:00Z'],
      ['c2', '둘째 사건', '2026-11-15T00:00:00Z'],
      ['c1', '첫 사건', '2026-11-14T00:00:00Z'],
    ].map(([id, title, created_at]) =>
      makeCase({ id, title, thought: title, status: 'closed', created_at }),
    )

  it('종결된 사건만 있어도 재방문 모습이고, 카드는 가장 최근 사건이다', async () => {
    serveCases(closedCases())
    renderAt('/')

    expect(await screen.findByText('이어하시겠어요?', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /셋째 사건.*종결.*이어하기/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '새 사건 접수하기' })).toBeInTheDocument()
  })

  it('종결된 사건의 이어하기 카드를 누르면 사건요약으로 간다', async () => {
    serveCases(closedCases())
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /셋째 사건.*이어하기/ }))

    expect(router.state.location.pathname).toBe('/cases/c3/summary')
  })

  it('휴지통을 누를 때마다 최근 사건부터 삭제를 요청하고, 모두 지우면 처음 방문 모습이 된다', async () => {
    const remaining = closedCases()
    serveCases(remaining)
    vi.mocked(apiClient.delete).mockImplementation(async (url) => {
      const id = url.split('/').pop()
      remaining.splice(
        remaining.findIndex((item) => item.id === id),
        1,
      )
      serveCases(remaining)
      return { status: 204 }
    })
    renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: '셋째 사건 사건 삭제' }))
    fireEvent.click(await screen.findByRole('button', { name: '둘째 사건 사건 삭제' }))
    expect(screen.queryByRole('button', { name: /셋째 사건/ })).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: '첫 사건 사건 삭제' }))

    await waitFor(() =>
      expect(vi.mocked(apiClient.delete).mock.calls.map(([url]) => url)).toEqual([
        '/cases/c3',
        '/cases/c2',
        '/cases/c1',
      ]),
    )
    expect(await screen.findByText('아직 접수한 사건이 없어요.')).toBeInTheDocument()
    expect(screen.queryByText('이어하시겠어요?', { exact: false })).not.toBeInTheDocument()
  })
})
