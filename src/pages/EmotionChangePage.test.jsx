import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

// 동료의 사건 조회(getCase)가 목업 저장소에서 300ms 기다리므로 대기 시간을 넉넉히 둔다.
configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

/** 사건 접수 화면이 목업 저장소(localStorage `mock-case-files`)에 저장한 모양 그대로 사건을 넣는다. */
const seedCase = (item) =>
  localStorage.setItem(
    'mock-case-files',
    JSON.stringify([
      {
        id: 'other-case',
        case_number: '2026-000001',
        title: null,
        thought: '다른 사건',
        emotion: { type: 'anger', intensity: 90 },
        emotion_after: null,
        status: 'received',
        created_at: '2026-11-13T00:00:00.000Z',
      },
      {
        case_number: '2026-000002',
        title: null,
        thought: '회의에서 발표를 망쳤다',
        emotion_after: null,
        status: 'received',
        created_at: '2026-11-13T01:00:00.000Z',
        ...item,
      },
    ]),
  )

const renderAt = (path, state) => {
  const router = createMemoryRouter(routes, { initialEntries: [{ pathname: path, state }] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('감정 변화 화면: 접수 당시 감정', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(apiClient.put)
      .mockReset()
      .mockResolvedValue({ data: { status: 'closed' } })
  })

  it('사건 접수에서 저장한 같은 caseId 사건의 감정 강도를 보여준다', async () => {
    seedCase({ id: 'case-35', emotion: { type: 'anxiety', intensity: 35 } })
    renderAt('/cases/case-35/emotion')
    expect(await screen.findByText('접수 당시: 35')).toBeInTheDocument()
  })

  it('접수 때 감정을 입력하지 않은 사건은 "기록 없음"을 보여준다', async () => {
    seedCase({ id: 'case-none', emotion: null })
    renderAt('/cases/case-none/emotion')
    expect(await screen.findByText('접수 당시: 기록 없음')).toBeInTheDocument()
  })

  it('저장소에 없는 사건이면 "기록 없음"을 보여준다', async () => {
    renderAt('/cases/no-such-case/emotion')
    expect(await screen.findByText('접수 당시: 기록 없음')).toBeInTheDocument()
  })

  it('예시 사건(sample)은 예시 값 70을 보여준다', async () => {
    renderAt('/cases/sample/emotion')
    expect(await screen.findByText('접수 당시: 70')).toBeInTheDocument()
  })

  it('판결 확정 때 emotion_after.type은 접수 때 type을 그대로 쓴다', async () => {
    seedCase({ id: 'case-shame', emotion: { type: 'shame', intensity: 35 } })
    renderAt('/cases/case-shame/emotion', {
      decision: { decision_type: 'reframed', final_statement: '다음엔 더 잘할 수 있다.' },
    })
    await screen.findByText('접수 당시: 35')

    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-shame/decision/final', {
        decision_type: 'reframed',
        final_statement: '다음엔 더 잘할 수 있다.',
        emotion_after: { type: 'shame', intensity: 40 },
      }),
    )
  })

  it('접수 때 감정이 없으면 판결 확정에 emotion_after를 보내지 않는다', async () => {
    seedCase({ id: 'case-none', emotion: null })
    renderAt('/cases/case-none/emotion', { decision: { decision_type: 'deferred' } })
    await screen.findByText('접수 당시: 기록 없음')

    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-none/decision/final', {
        decision_type: 'deferred',
      }),
    )
  })
})

describe('감정 변화 "다음": 판결 확정 응답이 위기 안내일 때', () => {
  const RISKY = '사실 요즘 죽고 싶다는 생각이 든다'

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    seedCase({ id: 'case-risk', emotion: { type: 'anxiety', intensity: 70 } })
    vi.mocked(apiClient.put)
      .mockReset()
      .mockResolvedValue({
        data: { outcome: 'support_required', support: { message: '...', contacts: [] } },
      })
  })

  it('위기 안내 화면(/support)으로 replace 이동하고, 최종 진술문 원문을 화면·이동 기록·요청 기록·저장소·주소에 남기지 않는다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter(routes, {
      initialEntries: [
        '/cases/case-risk/decision',
        {
          pathname: '/cases/case-risk/emotion',
          state: { decision: { decision_type: 'reframed', final_statement: RISKY } },
        },
      ],
      initialIndex: 1,
    })
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    await screen.findByText('접수 당시: 70')
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(await screen.findByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(apiClient.put).toHaveBeenCalledTimes(1)
    expect(router.state.location.pathname).toBe('/support')
    expect(router.state.historyAction).toBe('REPLACE')

    const { location } = router.state
    expect(document.body.textContent).not.toContain('죽고')
    expect(`${location.pathname}${location.search}${location.hash}`).not.toContain('죽고')
    expect(JSON.stringify(location.state ?? null)).not.toContain('죽고')
    expect(JSON.stringify({ ...localStorage })).not.toContain('죽고')
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('죽고')
    expect(
      queryClient
        .getMutationCache()
        .getAll()
        .filter((mutation) => JSON.stringify(mutation.state.variables ?? null).includes('죽고')),
    ).toHaveLength(0)
    // 종결 화면으로 가지 않는다.
    expect(screen.queryByRole('heading', { name: '사건이 종결되었습니다' })).not.toBeInTheDocument()
  })
})
