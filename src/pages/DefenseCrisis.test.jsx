import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

// 테스트용 위험 문장(접수 목업과 같은 단어 기준에 걸린다)
const RISKY = '요즘은 정말 죽고 싶어요'

/** 홈 → 변론 화면 순서로 기록을 쌓아 연다(뒤로 가기로 어디에 돌아가는지 보려고). */
const renderDefense = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, {
    initialEntries: ['/', '/cases/case-1/defense'],
    initialIndex: 1,
  })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await screen.findByText('첫 질문')
  return { router, queryClient }
}

/** 답변 입력창에 쓰고 보낸다. */
const sendAnswer = (text) => {
  fireEvent.change(screen.getByLabelText('답변'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))
}

describe('변론 답변 위기 신호 → 위기 안내 화면', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { case_number: '2026-031' } })
    vi.mocked(apiClient.post)
      .mockReset()
      .mockResolvedValue({ data: { id: 'q1', sequence: 1, prompt: '첫 질문', revision: 0 } })
    vi.mocked(apiClient.put).mockReset()
  })

  it('답변 응답이 support_required면 위기 안내 화면(/support)으로 replace 이동한다', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { outcome: 'support_required', support: { message: '...', contacts: [] } },
    })
    const { router } = await renderDefense()
    sendAnswer(RISKY)

    expect(await screen.findByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/support')
    expect(router.state.historyAction).toBe('REPLACE')

    // 뒤로 가기를 해도 대화 화면이 아니라 그 전(홈)으로 간다.
    await router.navigate(-1)
    expect(router.state.location.pathname).toBe('/')
  })

  it('위험한 답변 원문은 말풍선·입력창·요청 기록·저장소·주소 어디에도 남지 않는다', async () => {
    let resolvePut
    vi.mocked(apiClient.put).mockImplementation(
      () => new Promise((resolve) => (resolvePut = resolve)),
    )
    const { router, queryClient } = await renderDefense()
    sendAnswer(RISKY)

    // 보내는 즉시 입력창이 비고, 응답 전에도 말풍선으로 그리지 않는다.
    expect(screen.getByLabelText('답변')).toHaveValue('')
    expect(screen.queryByText(RISKY)).not.toBeInTheDocument()

    await waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1))
    resolvePut({ data: { outcome: 'support_required', support: { message: '...', contacts: [] } } })
    await waitFor(() => expect(router.state.location.pathname).toBe('/support'))

    expect(document.body.textContent).not.toContain(RISKY)
    const { location } = router.state
    expect(`${location.pathname}${location.search}${location.hash}`).not.toContain('죽고')
    expect(JSON.stringify(location.state ?? null)).not.toContain('죽고')
    expect(JSON.stringify({ ...localStorage })).not.toContain('죽고')
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('죽고')
    // 요청 기록(mutation 캐시)에서도 바로 지운다.
    const leftovers = queryClient
      .getMutationCache()
      .getAll()
      .filter((mutation) => JSON.stringify(mutation.state.variables ?? null).includes('죽고'))
    expect(leftovers).toHaveLength(0)
    // 위기 응답 뒤에는 대화를 다시 불러오지 않는다.
    expect(apiClient.post).toHaveBeenCalledTimes(1)
  })

  it('보통 답변은 그대로 대화를 이어 간다(이동하지 않고 대화를 다시 불러온다)', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
    const { router } = await renderDefense()
    sendAnswer('칭찬 받은 적이 있다')

    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(2))
    expect(router.state.location.pathname).toBe('/cases/case-1/defense')
    expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/defense/questions/q1/answer', {
      action: 'answer',
      text: '칭찬 받은 적이 있다',
      revision: 0,
    })
  })
})
