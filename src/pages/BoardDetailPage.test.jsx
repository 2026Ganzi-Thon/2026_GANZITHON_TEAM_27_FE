import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPostDetail } from '@/features/board'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const renderBoardDetailPage = async (entry = '/community/post-1') => {
  const router = createMemoryRouter(routes, { initialEntries: [entry] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('BoardDetailPage', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
  })

  it('게시판 상세 화면을 열면 기본 게시글 제목과 댓글 목록이 표시된다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockPostDetail,
    })

    await renderBoardDetailPage('/community/sample')

    expect(await screen.findByRole('heading', { level: 1, name: '게시판' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 2, name: mockPostDetail.title }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: `댓글 ${mockPostDetail.comment_count}개` }),
    ).toBeInTheDocument()
  })

  it('댓글 입력창에 글을 작성하고 전송하면 mock API가 호출된다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockPostDetail,
    })
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 'new-comment-id',
        author: '익명',
        content: '새 댓글입니다',
        created_at_label: '방금 전',
        like_count: 0,
      },
    })

    await renderBoardDetailPage('/community/post-1')

    const input = await screen.findByPlaceholderText('댓글을 입력해주세요...')
    fireEvent.change(input, { target: { value: '새 댓글입니다' } })

    const sendButton = screen.getByRole('button', { name: '댓글 전송' })
    fireEvent.click(sendButton)

    expect(input).toHaveValue('')
  })
})
