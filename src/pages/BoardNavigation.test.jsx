import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

// lazy 페이지를 불러오므로 느린 환경(CI)에서도 통과하도록 비동기 대기 시간을 늘린다.
configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

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
  vi.mocked(apiClient.get)
    .mockReset()
    .mockResolvedValue({ data: { items: [], next_cursor: null } })
  vi.mocked(apiClient.post).mockReset()
})

it('목록의 메뉴는 이동하지 않고 글 링크는 URL id로 상세를 조회한다', async () => {
  vi.mocked(apiClient.get).mockImplementation(async (url) =>
    url === '/board/posts'
      ? {
          data: {
            items: [
              {
                id: 'post-9',
                title: '목록 제목',
                body: '목록 본문',
                visibility: 'public',
                status: 'published',
                is_mine: true,
                like_count: 0,
                comment_count: 0,
                created_at: '2026-11-16T00:00:00Z',
              },
            ],
            next_cursor: null,
          },
        }
      : { data: { data: { title: '서버 제목', content: '서버 본문' } } },
  )
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

it('404는 재시도 대신 찾을 수 없음 안내와 비밀번호로 여는 폼을 표시한다', async () => {
  vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } })
  renderAt('/community/missing')
  await waitFor(() =>
    expect(screen.getByText('존재하지 않거나 열람할 수 없는 글이에요.')).toBeInTheDocument(),
  )
  expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('게시글 비밀번호')).toHaveAttribute('type', 'password')
})

it('비공개 글은 비밀번호로 열고, 비밀번호는 주소에 남기지 않는다', async () => {
  vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } })
  vi.mocked(apiClient.post).mockImplementation(async (url, body) => {
    if (url === '/board/posts/locked/unlock' && body.password === 'right-pw') {
      return {
        data: { title: '비밀 글', content: '비밀 본문', created_at: '2026-11-16T00:00:00Z' },
      }
    }
    throw { response: { status: 404 } }
  })
  const router = renderAt('/community/locked')
  const input = await screen.findByLabelText('게시글 비밀번호')

  fireEvent.change(input, { target: { value: 'wrong-pw' } })
  fireEvent.click(screen.getByRole('button', { name: '비밀번호로 열기' }))
  expect(await screen.findByText('비밀번호가 맞지 않거나 열람할 수 없는 글이에요.')).toBeVisible()

  fireEvent.change(screen.getByLabelText('게시글 비밀번호'), { target: { value: 'right-pw' } })
  fireEvent.click(screen.getByRole('button', { name: '비밀번호로 열기' }))
  expect(await screen.findByRole('heading', { name: '비밀 글' })).toBeInTheDocument()
  expect(apiClient.post).toHaveBeenLastCalledWith('/board/posts/locked/unlock', {
    password: 'right-pw',
  })
  const { location } = router.state
  expect(`${location.pathname}${location.search}${location.hash}`).not.toContain('right-pw')
  expect(JSON.stringify(location.state ?? null)).not.toContain('right-pw')
})
