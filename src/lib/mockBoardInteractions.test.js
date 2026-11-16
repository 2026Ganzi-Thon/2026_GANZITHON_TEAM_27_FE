import { beforeEach, describe, expect, it } from 'vitest'
import {
  addMockComment,
  clearMockInteractions,
  countMockInteractions,
  deleteMockComment,
  readMockInteractions,
  toggleMockCommentLike,
  toggleMockPostLike,
  updateMockComment,
} from './mockBoardInteractions'

describe('목업 게시판 공감·댓글 저장소', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('아무것도 하지 않은 글은 빈 기록이고, 공감은 누른 적 없음(null)이다', () => {
    expect(readMockInteractions('p1')).toEqual({ liked: null, comments: [], commentLikes: {} })
  })

  it('글 공감은 누르면 공감하고 다시 누르면 취소된다', () => {
    toggleMockPostLike('p1')
    expect(readMockInteractions('p1').liked).toBe(true)
    expect(countMockInteractions('p1').likes).toBe(1)

    toggleMockPostLike('p1')
    expect(readMockInteractions('p1').liked).toBe(false)
    expect(countMockInteractions('p1').likes).toBe(0)

    toggleMockPostLike('p1')
    expect(readMockInteractions('p1').liked).toBe(true)
  })

  it('원래 공감해 둔 글(예시 글)도 처음 누르면 취소된다', () => {
    toggleMockPostLike('sample', true)
    expect(readMockInteractions('sample').liked).toBe(false)

    toggleMockPostLike('sample', true)
    expect(readMockInteractions('sample').liked).toBe(true)
  })

  it('댓글을 달고 고치고 지울 수 있다', () => {
    const comment = addMockComment('p1', '처음 댓글')
    expect(readMockInteractions('p1').comments).toHaveLength(1)

    updateMockComment('p1', comment.id, '고친 댓글')
    expect(readMockInteractions('p1').comments[0].content).toBe('고친 댓글')

    deleteMockComment('p1', comment.id)
    expect(readMockInteractions('p1').comments).toEqual([])
  })

  it('내 댓글의 공감도 눌렀다 취소할 수 있다', () => {
    const comment = addMockComment('p1', '댓글')

    toggleMockCommentLike('p1', comment.id)
    expect(readMockInteractions('p1').comments[0].liked).toBe(true)

    toggleMockCommentLike('p1', comment.id)
    expect(readMockInteractions('p1').comments[0].liked).toBe(false)
  })

  it('예시 댓글(내 댓글이 아닌 것)의 공감도 눌렀다 취소할 수 있다', () => {
    toggleMockCommentLike('sample', 'comment-1')
    expect(readMockInteractions('sample').commentLikes).toEqual({ 'comment-1': true })

    toggleMockCommentLike('sample', 'comment-1')
    expect(readMockInteractions('sample').commentLikes).toEqual({ 'comment-1': false })
  })

  it('글마다 따로 저장하고, 글을 지우면 그 글의 기록도 지운다', () => {
    toggleMockPostLike('p1')
    addMockComment('p2', '댓글')

    clearMockInteractions('p1')

    expect(readMockInteractions('p1').liked).toBeNull()
    expect(countMockInteractions('p2')).toEqual({ likes: 0, comments: 1 })
  })
})
