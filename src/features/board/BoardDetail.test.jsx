import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  BoardActionBar,
  BoardCommentInput,
  BoardCommentSection,
  BoardDetailHeader,
  BoardDetailView,
  BoardPostContent,
  mockPostDetail,
} from './index'

describe('BoardDetailHeader', () => {
  it('헤더 타이틀과 뒤로가기, 공유 버튼을 렌더링하고 핸들러를 호출한다', () => {
    const handleBack = vi.fn()
    const handleShare = vi.fn()

    render(<BoardDetailHeader onBack={handleBack} onShare={handleShare} />)

    expect(screen.getByRole('heading', { level: 1, name: '게시판' })).toBeInTheDocument()

    const backButton = screen.getByRole('button', { name: '뒤로 가기' })
    expect(backButton).toBeInTheDocument()
    fireEvent.click(backButton)
    expect(handleBack).toHaveBeenCalledTimes(1)

    const shareButton = screen.getByRole('button', { name: '게시글 공유' })
    expect(shareButton).toBeInTheDocument()
    fireEvent.click(shareButton)
    expect(handleShare).toHaveBeenCalledTimes(1)
  })
})

describe('BoardPostContent', () => {
  it('게시글 제목, 작성자, 작성시간, 공감수, 본문을 올바르게 렌더링한다', () => {
    const handleOptions = vi.fn()

    render(
      <BoardPostContent
        title="나 진짜 개쓰레기인가봐"
        content="오늘도 회의에서 한마디도 못함..."
        author="익명"
        createdAtLabel="2시간 전"
        likeCount={24}
        onOptionsClick={handleOptions}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '나 진짜 개쓰레기인가봐' }),
    ).toBeInTheDocument()
    expect(screen.getByText('익명')).toBeInTheDocument()
    expect(screen.getByText('2시간 전')).toBeInTheDocument()
    expect(screen.getByText('♡ 24')).toBeInTheDocument()
    expect(screen.getByText('오늘도 회의에서 한마디도 못함...')).toBeInTheDocument()

    const moreButton = screen.getByRole('button', { name: '게시글 옵션 더보기' })
    fireEvent.click(moreButton)
    expect(handleOptions).toHaveBeenCalledTimes(1)
  })
})

describe('BoardActionBar', () => {
  it('공감 버튼, 댓글 버튼, 북마크 버튼이 렌더링되고 클릭 이벤트를 전달한다', () => {
    const handleLike = vi.fn()
    const handleComment = vi.fn()
    const handleBookmark = vi.fn()

    render(
      <BoardActionBar
        likeCount={24}
        isLiked={true}
        isBookmarked={false}
        onLike={handleLike}
        onCommentClick={handleComment}
        onBookmark={handleBookmark}
      />,
    )

    const likeButton = screen.getByRole('button', { name: /공감하기/ })
    expect(likeButton).toHaveTextContent('24')
    fireEvent.click(likeButton)
    expect(handleLike).toHaveBeenCalledTimes(1)

    const commentButton = screen.getByRole('button', { name: '댓글로 이동' })
    fireEvent.click(commentButton)
    expect(handleComment).toHaveBeenCalledTimes(1)

    const bookmarkButton = screen.getByRole('button', { name: '북마크 추가' })
    fireEvent.click(bookmarkButton)
    expect(handleBookmark).toHaveBeenCalledTimes(1)
  })
})

describe('BoardCommentSection', () => {
  it('댓글 총 개수와 목록을 렌더링한다', () => {
    const handleLike = vi.fn()
    const handleOptions = vi.fn()

    render(
      <BoardCommentSection
        commentCount={2}
        comments={[
          {
            id: 'c1',
            author: '익명1',
            content: '저도 그런 적 많아요 힘내세요',
            created_at_label: '1시간 전',
            like_count: 5,
          },
          {
            id: 'c2',
            author: '익명2',
            content: '누구나 실수할 수 있어요',
            created_at_label: '30분 전',
            like_count: 2,
          },
        ]}
        onCommentLike={handleLike}
        onCommentOptions={handleOptions}
      />,
    )

    expect(screen.getByRole('heading', { level: 3, name: '댓글 2개' })).toBeInTheDocument()
    expect(screen.getByText('익명1')).toBeInTheDocument()
    expect(screen.getByText('저도 그런 적 많아요 힘내세요')).toBeInTheDocument()
    expect(screen.getByText('1시간 전')).toBeInTheDocument()
    expect(screen.getByText('♡ 5')).toBeInTheDocument()

    expect(screen.getByText('익명2')).toBeInTheDocument()
    expect(screen.getByText('누구나 실수할 수 있어요')).toBeInTheDocument()

    const commentOptionsButtons = screen.getAllByRole('button', { name: '댓글 옵션 더보기' })
    expect(commentOptionsButtons).toHaveLength(2)
    fireEvent.click(commentOptionsButtons[0])
    expect(handleOptions).toHaveBeenCalledWith('c1')
  })
})

describe('BoardCommentInput', () => {
  it('입력값이 없을 때는 전송 버튼이 비활성화되고, 입력 후 제출하면 onSubmit을 호출하고 초기화된다', () => {
    const handleSubmit = vi.fn()

    render(<BoardCommentInput onSubmit={handleSubmit} />)

    const input = screen.getByPlaceholderText('댓글을 입력해주세요...')
    const submitButton = screen.getByRole('button', { name: '댓글 전송' })

    expect(submitButton).toBeDisabled()

    fireEvent.change(input, { target: { value: '응원합니다!' } })
    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)
    expect(handleSubmit).toHaveBeenCalledWith('응원합니다!')
    expect(input).toHaveValue('')
  })
})

describe('BoardDetailView', () => {
  it('전체 게시글 상세 화면을 피그마 목업 데이터와 함께 정상 렌더링한다', () => {
    const handleBack = vi.fn()
    const handleAddComment = vi.fn()

    render(
      <BoardDetailView post={mockPostDetail} onBack={handleBack} onAddComment={handleAddComment} />,
    )

    // 피그마 노드 71-20 타이틀
    expect(screen.getByText(mockPostDetail.title)).toBeInTheDocument()
    // 피그마 노드 71-20 댓글 개수
    expect(screen.getByText(`댓글 ${mockPostDetail.comment_count}개`)).toBeInTheDocument()
    // 첫 번째 댓글 내용
    expect(screen.getByText(mockPostDetail.comments[0].content)).toBeInTheDocument()
  })
})
