import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { advanceMockCaseStatus } from '@/lib/mockCaseDecisions'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

/** 접수한 사건 하나를 임시 저장소에 넣는다. */
const seedCase = (overrides = {}) => {
  const item = {
    id: 'case-1',
    title: null,
    thought: '발표가 걱정돼요',
    emotion: { type: 'anxiety', intensity: 70 },
    emotion_after: null,
    status: 'received',
    created_at: '2026-11-16T00:00:00Z',
    ...overrides,
  }
  localStorage.setItem('mock-case-files', JSON.stringify([item]))
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
})

describe('홈의 이어하기 카드', () => {
  it.each([
    ['received', '/cases/case-1/prosecution'],
    ['evidence_review', '/cases/case-1/prosecution'],
    ['defense', '/cases/case-1/defense'],
    ['decision_review', '/cases/case-1/decision'],
  ])('상태가 %s이면 %s로 이어간다', async (status, expectedPath) => {
    seedCase({ status })
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /이어하기/ }))

    expect(router.state.location.pathname).toBe(expectedPath)
  })

  it('기소·판결 목업이 남긴 진행 상태를 따라 이어간다', async () => {
    seedCase()
    advanceMockCaseStatus('case-1', 'defense', { title: '회의 발표 사건' })
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /회의 발표 사건.*이어하기/ }))

    expect(router.state.location.pathname).toBe('/cases/case-1/defense')
  })

  it('종결된 사건 카드는 사건요약으로 간다', async () => {
    seedCase({ status: 'closed', title: '끝난 사건' })
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /끝난 사건.*감정 변화/ }))

    expect(router.state.location.pathname).toBe('/cases/case-1/summary')
  })
})

describe('사건 목록의 사건 카드', () => {
  it('진행 중인 사건은 진행 상태에 맞는 화면으로 간다', async () => {
    seedCase({ status: 'decision_review', title: '진행 중 사건' })
    const router = renderAt('/court')

    fireEvent.click(await screen.findByRole('button', { name: /진행 중 사건.*감정 변화/ }))

    expect(router.state.location.pathname).toBe('/cases/case-1/decision')
  })
})

describe('홈의 재방문 모습과 삭제', () => {
  /** 최근 순서가 분명하도록 시각이 다른 종결 사건 여러 개를 넣는다. */
  const seedClosedCases = () => {
    const make = (id, title, created_at) => ({
      id,
      title,
      thought: title,
      emotion: { type: 'anxiety', intensity: 70 },
      emotion_after: null,
      status: 'closed',
      created_at,
    })
    localStorage.setItem(
      'mock-case-files',
      JSON.stringify([
        make('c1', '첫 사건', '2026-11-14T00:00:00Z'),
        make('c2', '둘째 사건', '2026-11-15T00:00:00Z'),
        make('c3', '셋째 사건', '2026-11-16T00:00:00Z'),
      ]),
    )
  }

  it('종결된 사건만 있어도 재방문 모습이고, 카드는 가장 최근 사건이다', async () => {
    seedClosedCases()
    renderAt('/')

    expect(await screen.findByText('이어하시겠어요?', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /셋째 사건.*종결.*이어하기/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '새 사건 접수하기' })).toBeInTheDocument()
  })

  it('종결된 사건의 이어하기 카드를 누르면 사건요약으로 간다', async () => {
    seedClosedCases()
    const router = renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: /셋째 사건.*이어하기/ }))

    expect(router.state.location.pathname).toBe('/cases/c3/summary')
  })

  it('휴지통을 누를 때마다 최근 사건부터 하나씩 지워지고 모두 지우면 처음 방문 모습이 된다', async () => {
    seedClosedCases()
    renderAt('/')

    fireEvent.click(await screen.findByRole('button', { name: '셋째 사건 사건 삭제' }))
    fireEvent.click(await screen.findByRole('button', { name: '둘째 사건 사건 삭제' }))
    expect(screen.queryByRole('button', { name: /셋째 사건/ })).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: '첫 사건 사건 삭제' }))

    expect(await screen.findByText('아직 접수한 사건이 없어요.')).toBeInTheDocument()
    expect(screen.queryByText('이어하시겠어요?', { exact: false })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /사건 접수하기/ })).toBeInTheDocument()
  })
})
