import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }))

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
  vi.mocked(apiClient.get).mockReset()
})

it('목록의 메뉴는 이동하지 않고 글 링크는 URL id로 상세를 조회한다', async () => {
  localStorage.setItem(
    'mock-board-posts',
    JSON.stringify([
      {
        id: 'post-9',
        title: '목록 제목',
        body: '목록 본문',
        visibility: 'public',
        created_at: '2026-11-16T00:00:00Z',
      },
    ]),
  )
  vi.mocked(apiClient.get).mockResolvedValue({
    data: { data: { title: '서버 제목', content: '서버 본문' } },
  })
  const router = renderAt('/community/posts')
  fireEvent.click(await screen.findByRole('button', { name: '글 메뉴' }))
  expect(router.state.location.pathname).toBe('/community/posts')
  fireEvent.click(screen.getByRole('link', { name: '목록 제목' }))
  expect(await screen.findByRole('heading', { name: '서버 제목' })).toBeInTheDocument()
  expect(apiClient.get).toHaveBeenCalledWith('/board/posts/post-9')
  expect(router.state.location.state).toBeNull()
})

it('연필에서 글쓰기로 이동하고 비공개 왕복 후 제목·본문을 유지한다', async () => {
  const router = renderAt('/community/posts')
  fireEvent.click(await screen.findByRole('link', { name: '글쓰기' }))
  fireEvent.change(await screen.findByRole('textbox', { name: '제목' }), {
    target: { value: '유지할 제목' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), {
    target: { value: '유지할 본문' },
  })
  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  expect(await screen.findByRole('dialog', { name: '비공개 설정' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/community/write/private')
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password' } })
  await act(() => router.navigate(-1))
  expect(await screen.findByRole('textbox', { name: '제목' })).toHaveValue('유지할 제목')
  expect(screen.getByRole('textbox', { name: '본문' })).toHaveValue('유지할 본문')
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))
  expect(await screen.findByLabelText('비밀번호')).toHaveValue('')
})

it('직접 접속 실패 시 재시도하고 누락된 값은 더미로 채우지 않는다', async () => {
  vi.mocked(apiClient.get)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ data: { title: '복구된 글', content: '본문' } })
  renderAt('/community/direct-id')
  fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))
  expect(await screen.findByRole('heading', { name: '복구된 글' })).toBeInTheDocument()
  expect(screen.queryByText('2시간 전')).not.toBeInTheDocument()
  expect(apiClient.get).toHaveBeenLastCalledWith('/board/posts/direct-id')
})

it('404는 재시도 대신 찾을 수 없음 안내를 표시한다', async () => {
  vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } })
  renderAt('/community/missing')
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('존재하지 않거나 열람할 수 없는 글'),
  )
  expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
})
