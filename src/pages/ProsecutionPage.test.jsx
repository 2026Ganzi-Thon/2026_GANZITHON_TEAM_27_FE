import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

/** 실제 라우트로 기소 화면을 연다(휴정하기 → 홈 이동까지 확인하려고 라우터 전체를 쓴다). */
const renderProsecution = async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/cases/case-1/prosecution'] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await screen.findByRole('heading', { name: '기소' })
  return router
}

/** < 버튼을 눌러 휴정 모달을 연다. */
const openRecess = () => {
  const back = screen.getByRole('button', { name: '뒤로 가기' })
  back.focus()
  fireEvent.click(back)
  return { back, dialog: screen.getByRole('dialog', { name: '지금은 잠시 휴정할까요?' }) }
}

describe('기소 화면 뒤로가기 → 휴정 모달', () => {
  beforeEach(() => {
    // 기소 화면 데이터는 이 테스트의 관심사가 아니므로 불러오는 중으로 둔다.
    vi.mocked(apiClient.get)
      .mockReset()
      .mockReturnValue(new Promise(() => {}))
    vi.mocked(apiClient.post)
      .mockReset()
      .mockReturnValue(new Promise(() => {}))
    vi.mocked(apiClient.put).mockReset()
  })

  it('< 버튼을 누르면 이전 화면으로 가지 않고 휴정 모달이 열린다', async () => {
    const router = await renderProsecution()
    const { dialog } = openRecess()

    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: '휴정하기' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: '취소' })).toHaveFocus()
    expect(router.state.location.pathname).toBe('/cases/case-1/prosecution')
  })

  it('"휴정하기"를 누르면 서버 API 없이 홈(/)으로 간다', async () => {
    const router = await renderProsecution()
    const callsBefore = [apiClient.get, apiClient.post, apiClient.put].map(
      (fn) => vi.mocked(fn).mock.calls.length,
    )
    const { dialog } = openRecess()
    fireEvent.click(within(dialog).getByRole('button', { name: '휴정하기' }))

    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByRole('heading', { name: 'Thought Court' })).toBeInTheDocument()
    expect(
      [apiClient.get, apiClient.post, apiClient.put].map((fn) => vi.mocked(fn).mock.calls.length),
    ).toEqual(callsBefore)
  })

  it.each([
    ['취소', (dialog) => fireEvent.click(within(dialog).getByRole('button', { name: '취소' }))],
    ['X', (dialog) => fireEvent.click(within(dialog).getByRole('button', { name: '닫기' }))],
    ['바깥 클릭', (dialog) => fireEvent.click(dialog.parentElement)],
    ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
  ])('%s → 모달만 닫히고 기소 화면에 남으며, 포커스가 < 버튼으로 돌아간다', async (_, close) => {
    const router = await renderProsecution()
    const { back, dialog } = openRecess()
    close(dialog)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cases/case-1/prosecution')
    expect(screen.getByRole('heading', { name: '기소' })).toBeInTheDocument()
    expect(back).toHaveFocus()
  })

  it('클릭해도 < 버튼에 포커스가 가지 않는 브라우저에서도 닫으면 < 버튼으로 포커스가 돌아간다', async () => {
    await renderProsecution()
    const back = screen.getByRole('button', { name: '뒤로 가기' })
    document.body.focus()
    fireEvent.click(back) // 포커스를 옮기지 않고 클릭만 한다(Safari와 같은 상황)
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(back).toHaveFocus()
  })
})

describe('기소 화면 "변론 시작" → 변론 화면', () => {
  const draft = {
    title: '회의 발표 사건',
    claim: '피고인은 "나는 쓸모없어" 라는 생각으로\n본 법정에 기소되었습니다.',
    pattern_candidates: ['labeling'],
    evidence: [{ type: 'observed', text: '실수 후 자책한 기록' }],
  }
  let resolvePut

  beforeEach(() => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { id: 'case-1', case_number: '2026-031' } })
    // 기소 초안은 바로 주고, 변론 질문 요청은 끝나지 않게 둔다(변론 화면이 열렸는지만 본다).
    vi.mocked(apiClient.post)
      .mockReset()
      .mockImplementation((url) =>
        url.endsWith('/prosecution') ? Promise.resolve({ data: draft }) : new Promise(() => {}),
      )
    vi.mocked(apiClient.put)
      .mockReset()
      .mockImplementation(() => new Promise((resolve) => (resolvePut = resolve)))
  })

  it('근거 확정(PUT evidence)에 성공하면 같은 사건의 변론 화면(/cases/case-1/defense)으로 간다', async () => {
    const router = await renderProsecution()
    fireEvent.click(await screen.findByRole('button', { name: '변론 시작' }))

    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith(
        '/cases/case-1/evidence',
        expect.objectContaining({ claim: draft.claim }),
      ),
    )
    // 응답 전에는 아직 기소 화면이다.
    expect(router.state.location.pathname).toBe('/cases/case-1/prosecution')

    resolvePut({ data: { status: 'defense' } })
    expect(await screen.findByRole('heading', { name: '변론' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cases/case-1/defense')
  })

  it('요청 중에는 버튼이 비활성화되어 두 번 보내지 않는다', async () => {
    await renderProsecution()
    const start = await screen.findByRole('button', { name: '변론 시작' })
    fireEvent.click(start)

    const busy = await screen.findByRole('button', { name: '변론 준비 중…' })
    expect(busy).toBeDisabled()
    expect(busy).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(busy)
    expect(apiClient.put).toHaveBeenCalledTimes(1)
  })

  it('근거 확정에 실패하면 이동하지 않고 기소 화면에 남는다', async () => {
    vi.mocked(apiClient.put).mockReset().mockRejectedValue(new Error('network'))
    const router = await renderProsecution()
    fireEvent.click(await screen.findByRole('button', { name: '변론 시작' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cases/case-1/prosecution')
    expect(screen.getByRole('button', { name: '변론 시작' })).toBeEnabled()
  })
})
