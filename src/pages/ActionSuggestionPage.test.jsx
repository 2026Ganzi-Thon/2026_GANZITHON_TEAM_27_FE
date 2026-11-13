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

/** 실제 라우트로 행동 제안 화면을 연다(홈 이동까지 확인하려고 라우터 전체를 쓴다). */
const renderAction = async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/cases/case-7/action'] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await screen.findByRole('heading', { name: 'YOUR NEXTMOVE.' })
  return router
}

const pathOf = (router) => router.state.location.pathname
const radios = () => screen.getAllByRole('radio')

describe('행동 제안 화면 연결', () => {
  let resolvePut

  beforeEach(() => {
    localStorage.clear()
    vi.mocked(apiClient.put)
      .mockReset()
      .mockImplementation(() => new Promise((resolve) => (resolvePut = resolve)))
  })

  it('카드를 눌러도 주소는 바뀌지 않고 선택 표시만 옮겨 간다', async () => {
    const router = await renderAction()
    expect(screen.getByRole('radio', { name: /02\/MUSIC/ })).toBeChecked()

    fireEvent.click(radios()[0])
    expect(radios()[0]).toBeChecked()
    expect(screen.getByRole('radio', { name: /02\/MUSIC/ })).not.toBeChecked()
    expect(pathOf(router)).toBe('/cases/case-7/action')
    expect(apiClient.put).not.toHaveBeenCalled()
  })

  it('"LET’S DO IT"은 선택한 카드 설명으로 follow-up(action)을 보낸 뒤 홈으로 간다', async () => {
    const router = await renderAction()
    fireEvent.click(radios()[0]) // "01/ WALK" — 5분 산책하기
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-7/follow-up', {
        choice: 'action',
        action_text: '5분 산책하기',
      }),
    )
    expect(pathOf(router)).toBe('/cases/case-7/action')
    resolvePut({ data: {} })
    await waitFor(() => expect(pathOf(router)).toBe('/'))
  })

  it('"오늘은 쉬기"는 follow-up(rest)을 보낸 뒤 홈으로 간다', async () => {
    const router = await renderAction()
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))

    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-7/follow-up', { choice: 'rest' }),
    )
    resolvePut({ data: {} })
    await waitFor(() => expect(pathOf(router)).toBe('/'))
  })

  it('요청 중에는 두 버튼과 카드가 비활성화되어 두 번 보내지 않는다', async () => {
    await renderAction()
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'LET’S DO IT' })).toBeDisabled())
    expect(screen.getByRole('button', { name: '오늘은 쉬기' })).toBeDisabled()
    radios().forEach((radio) => expect(radio).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))
    expect(apiClient.put).toHaveBeenCalledTimes(1)
  })

  it('저장에 실패하면 화면에 남아 오류를 보여주고 다시 누를 수 있다', async () => {
    vi.mocked(apiClient.put).mockReset().mockRejectedValue(new Error('network'))
    const router = await renderAction()
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(pathOf(router)).toBe('/cases/case-7/action')
    expect(screen.getByRole('button', { name: '오늘은 쉬기' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'LET’S DO IT' })).toBeEnabled()
  })

  it('저장 응답이 support_required면 위기 안내 화면(/support)으로 replace 이동하고 보낸 내용을 남기지 않는다', async () => {
    vi.mocked(apiClient.put)
      .mockReset()
      .mockResolvedValue({
        data: { outcome: 'support_required', support: { message: '...', contacts: [] } },
      })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter(routes, {
      initialEntries: ['/', '/cases/case-7/action'],
      initialIndex: 1,
    })
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    await screen.findByRole('heading', { name: 'YOUR NEXTMOVE.' })
    fireEvent.click(radios()[0]) // "5분 산책하기"
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    expect(await screen.findByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(pathOf(router)).toBe('/support')
    expect(router.state.historyAction).toBe('REPLACE')
    const { location } = router.state
    expect(
      `${location.search}${location.hash}${JSON.stringify(location.state ?? null)}`,
    ).not.toContain('산책')
    expect(
      queryClient
        .getMutationCache()
        .getAll()
        .filter((mutation) => JSON.stringify(mutation.state.variables ?? null).includes('산책')),
    ).toHaveLength(0)
    expect(JSON.stringify({ ...localStorage })).not.toContain('산책')

    // 뒤로 가기로 행동 제안 화면에 돌아오지 않는다.
    await router.navigate(-1)
    expect(pathOf(router)).toBe('/')
  })
})
