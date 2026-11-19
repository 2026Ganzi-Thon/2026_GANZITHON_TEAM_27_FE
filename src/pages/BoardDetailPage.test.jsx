import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPostDetail } from '@/features/board'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
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
    vi.mocked(apiClient.put).mockReset()
    vi.mocked(apiClient.delete).mockReset()
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

  it('내 글이면 옵션 메뉴에서 글을 수정·삭제할 수 있다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { ...mockPostDetail, is_mine: true },
    })
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { id: 'post-1', status: 'pending_review' },
    })
    vi.mocked(apiClient.delete).mockResolvedValue({})

    const router = await renderBoardDetailPage('/community/post-1')

    const postOptions = await screen.findByRole('button', { name: '게시글 옵션 더보기' })
    fireEvent.click(postOptions)
    fireEvent.click(screen.getByRole('menuitem', { name: '글 수정' }))

    const titleInput = screen.getByLabelText('게시글 제목 수정')
    const bodyInput = screen.getByLabelText('게시글 본문 수정')
    fireEvent.change(titleInput, { target: { value: '수정된 제목' } })
    fireEvent.change(bodyInput, { target: { value: '수정된 본문' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(apiClient.put).toHaveBeenCalledWith('/board/posts/post-1', {
      title: '수정된 제목',
      body: '수정된 본문',
    })

    fireEvent.click(screen.getByRole('button', { name: '게시글 옵션 더보기' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '글 삭제' }))
    fireEvent.click(screen.getByRole('button', { name: '삭제 확인' }))

    expect(apiClient.delete).toHaveBeenCalledWith('/board/posts/post-1')
    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe('/community')
    })
  })

  it('댓글 공감과 내 댓글 수정·삭제가 백엔드 API를 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        ...mockPostDetail,
        comments: [
          {
            id: 'c-mine',
            author: '익명',
            content: '원래 댓글',
            created_at_label: '방금 전',
            like_count: 1,
            is_liked: false,
            is_mine: true,
          },
        ],
      },
    })
    vi.mocked(apiClient.put).mockResolvedValue({ data: { liked: true, like_count: 2 } })
    vi.mocked(apiClient.delete).mockResolvedValue({})

    await renderBoardDetailPage('/community/post-1')

    const likeButton = await screen.findByRole('button', { name: '댓글 공감' })
    fireEvent.click(likeButton)
    expect(apiClient.put).toHaveBeenCalledWith('/board/comments/c-mine/like')

    fireEvent.click(screen.getByRole('button', { name: '댓글 옵션 더보기' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '댓글 수정' }))
    const editInput = screen.getByLabelText('댓글 수정 입력')
    fireEvent.change(editInput, { target: { value: '고친 댓글' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(apiClient.put).toHaveBeenCalledWith('/board/comments/c-mine', { body: '고친 댓글' })

    fireEvent.click(screen.getByRole('button', { name: '댓글 옵션 더보기' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '댓글 삭제' }))
    expect(apiClient.delete).toHaveBeenCalledWith('/board/comments/c-mine')
  })
})
