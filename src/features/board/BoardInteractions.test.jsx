import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BoardCommentSection, BoardPostContent } from './index'

describe('게시글 옵션 메뉴', () => {
  const baseProps = { title: '제목', content: '본문', author: '익명', createdAtLabel: '방금 전' }

  it('내 글이면 ···을 눌러 수정하기·삭제하기를 쓸 수 있다', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<BoardPostContent {...baseProps} isMine onEdit={onEdit} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: '게시글 옵션 더보기' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }))
    expect(onEdit).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: '게시글 옵션 더보기' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('남의 글이면 메뉴가 열리지 않는다', () => {
    render(<BoardPostContent {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: '게시글 옵션 더보기' }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('Esc를 누르면 메뉴가 닫힌다', () => {
    render(<BoardPostContent {...baseProps} isMine />)

    fireEvent.click(screen.getByRole('button', { name: '게시글 옵션 더보기' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('댓글 수정·삭제·공감', () => {
  const comments = [
    {
      id: 'c1',
      author: '익명',
      content: '남의 댓글',
      created_at_label: '1시간 전',
      like_count: 3,
      is_liked: false,
      mine: false,
    },
    {
      id: 'c2',
      author: '익명',
      content: '내 댓글',
      created_at_label: '방금 전',
      like_count: 0,
      is_liked: false,
      mine: true,
    },
  ]

  it('내 댓글은 ···에서 수정하기를 눌러 그 자리에서 고치고 저장한다', () => {
    const onCommentEdit = vi.fn()
    render(
      <BoardCommentSection commentCount={2} comments={comments} onCommentEdit={onCommentEdit} />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: '댓글 옵션 더보기' })[1])
    fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }))
    const input = screen.getByRole('textbox', { name: '댓글 수정' })
    expect(input).toHaveValue('내 댓글')
    fireEvent.change(input, { target: { value: '고친 댓글' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(onCommentEdit).toHaveBeenCalledWith('c2', '고친 댓글')
    expect(screen.queryByRole('textbox', { name: '댓글 수정' })).not.toBeInTheDocument()
  })

  it('수정을 취소하거나 내용을 비우면 저장하지 않는다', () => {
    const onCommentEdit = vi.fn()
    render(
      <BoardCommentSection commentCount={2} comments={comments} onCommentEdit={onCommentEdit} />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: '댓글 옵션 더보기' })[1])
    fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }))
    fireEvent.change(screen.getByRole('textbox', { name: '댓글 수정' }), {
      target: { value: '   ' },
    })
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(onCommentEdit).not.toHaveBeenCalled()
    expect(screen.getByText('내 댓글')).toBeInTheDocument()
  })

  it('내 댓글은 삭제하기로 지운다', () => {
    const onCommentDelete = vi.fn()
    render(
      <BoardCommentSection
        commentCount={2}
        comments={comments}
        onCommentDelete={onCommentDelete}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: '댓글 옵션 더보기' })[1])
    fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }))

    expect(onCommentDelete).toHaveBeenCalledWith('c2')
  })

  it('남의 댓글은 메뉴가 열리지 않는다', () => {
    render(<BoardCommentSection commentCount={2} comments={comments} />)

    fireEvent.click(screen.getAllByRole('button', { name: '댓글 옵션 더보기' })[0])

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('모든 댓글의 공감 버튼을 누를 수 있고, 공감한 댓글은 눌린 상태로 보인다', () => {
    const onCommentLike = vi.fn()
    render(
      <BoardCommentSection
        commentCount={2}
        comments={[{ ...comments[0], is_liked: true, like_count: 4 }, comments[1]]}
        onCommentLike={onCommentLike}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '♡ 4' }))
    fireEvent.click(screen.getByRole('button', { name: '♡ 0' }))

    expect(onCommentLike).toHaveBeenNthCalledWith(1, 'c1')
    expect(onCommentLike).toHaveBeenNthCalledWith(2, 'c2')
    expect(screen.getByRole('button', { name: '♡ 4' })).toHaveAttribute('aria-pressed', 'true')
  })
})
