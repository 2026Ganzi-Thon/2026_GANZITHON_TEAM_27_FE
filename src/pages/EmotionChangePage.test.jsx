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
