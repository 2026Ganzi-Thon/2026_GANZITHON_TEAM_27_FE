import { describe, expect, it } from 'vitest'
import { createMockPostDetail, createMockSampleDetail } from './mocks/boardMocks'

const NOW = Date.parse('2026-11-16T12:00:00Z')
const ago = (ms) => new Date(NOW - ms).toISOString()
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

const NONE = { liked: null, comments: [], commentLikes: {} }

describe('createMockPostDetail', () => {
  const post = { title: '제목', body: '본문', visibility: 'public', created_at: ago(0) }

  it('내 글을 상세 응답 모양(content, 작성자, 빈 댓글)으로 바꾼다', () => {
    expect(createMockPostDetail(post, NONE, NOW)).toEqual({
      title: '제목',
      content: '본문',
      author: '익명',
      created_at_label: '방금 전',
      like_count: 0,
      is_liked: false,
      is_bookmarked: false,
      is_mine: true,
      visibility: 'public',
      comment_count: 0,
      comments: [],
    })
  })

  it.each([
    [5 * MINUTE, '5분 전'],
    [2 * HOUR, '2시간 전'],
    [3 * 24 * HOUR, '3일 전'],
  ])('올린 지 %i ms가 지나면 %s로 보여준다', (age, label) => {
    expect(
      createMockPostDetail({ ...post, created_at: ago(age) }, NONE, NOW).created_at_label,
    ).toBe(label)
  })

  it('내가 한 공감과 단 댓글을 합쳐서 보여주고, 내 댓글만 mine으로 표시한다', () => {
    const detail = createMockPostDetail(
      post,
      {
        liked: true,
        commentLikes: {},
        comments: [{ id: 'c1', content: '내 댓글', created_at: ago(5 * MINUTE), liked: true }],
      },
      NOW,
    )

    expect(detail).toMatchObject({ like_count: 1, is_liked: true, comment_count: 1 })
    expect(detail.comments[0]).toMatchObject({
      id: 'c1',
      content: '내 댓글',
      created_at_label: '5분 전',
      like_count: 1,
      is_liked: true,
      mine: true,
    })
  })
})

describe('createMockSampleDetail', () => {
  it('아무것도 누르지 않으면 예시 글 원래 상태(공감 24, 공감함)이고, 예시 댓글은 내 댓글이 아니다', () => {
    const detail = createMockSampleDetail(NONE, NOW)

    expect(detail).toMatchObject({ like_count: 24, is_liked: true, is_mine: false })
    expect(detail.comments[0]).toMatchObject({ id: 'comment-1', mine: false, like_count: 24 })
  })

  it('원래 공감해 둔 예시 글의 공감을 취소하면 수가 하나 줄고, 다시 누르면 돌아온다', () => {
    expect(createMockSampleDetail({ ...NONE, liked: false }, NOW)).toMatchObject({
      like_count: 23,
      is_liked: false,
    })
    expect(createMockSampleDetail({ ...NONE, liked: true }, NOW)).toMatchObject({
      like_count: 24,
      is_liked: true,
    })
  })

  it('예시 댓글에 공감하면 수가 하나 올라가고, 취소하면 원래대로 돌아온다', () => {
    const liked = createMockSampleDetail({ ...NONE, commentLikes: { 'comment-1': true } }, NOW)
    const cancelled = createMockSampleDetail({ ...NONE, commentLikes: { 'comment-1': false } }, NOW)

    expect(liked.comments[0]).toMatchObject({ like_count: 25, is_liked: true })
    expect(cancelled.comments[0]).toMatchObject({ like_count: 24, is_liked: false })
  })

  it('내가 단 댓글이 예시 댓글 뒤에 붙는다', () => {
    const detail = createMockSampleDetail(
      {
        ...NONE,
        comments: [{ id: 'mine-1', content: '추가', created_at: ago(0), liked: false }],
      },
      NOW,
    )

    expect(detail.comment_count).toBe(2)
    expect(detail.comments.map((comment) => comment.mine)).toEqual([false, true])
  })
})
