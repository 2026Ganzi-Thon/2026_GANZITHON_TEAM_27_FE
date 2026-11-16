import { describe, expect, it } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import {
  buildPostContent,
  canPost,
  formatPostTime,
  toPostView,
  validatePostPassword,
} from './utils'

describe('validatePostPassword', () => {
  it('6~64자이면 통과한다', () => {
    expect(validatePostPassword('123456')).toBe('')
    expect(validatePostPassword('a'.repeat(64))).toBe('')
  })

  it('비어 있거나 6자 미만이면 안내 문구를 돌려준다', () => {
    expect(validatePostPassword('')).toBe('비밀번호를 입력해주세요.')
    expect(validatePostPassword('12345')).toBe('비밀번호는 6자 이상이어야 해요.')
  })

  it('64자를 넘으면 안내 문구를 돌려준다', () => {
    expect(validatePostPassword('a'.repeat(65))).toBe('비밀번호는 64자 이하여야 해요.')
  })
})

describe('canPost', () => {
  it('공개 범위를 고르지 않았으면 게시할 수 없다', () => {
    expect(canPost(null, '')).toBe(false)
  })

  it('전체 공개는 비밀번호 없이 게시할 수 있다', () => {
    expect(canPost(VISIBILITY.public, '')).toBe(true)
  })

  it('비공개는 비밀번호가 규칙에 맞을 때만 게시할 수 있다', () => {
    expect(canPost(VISIBILITY.passwordProtected, '')).toBe(false)
    expect(canPost(VISIBILITY.passwordProtected, '12345')).toBe(false)
    expect(canPost(VISIBILITY.passwordProtected, 'long-enough-pw')).toBe(true)
  })
})

describe('buildPostContent', () => {
  it('사건명과 최종 진술문으로 제목과 본문을 만든다', () => {
    expect(
      buildPostContent({
        title: '회의 발표 사건',
        thought: '나는 쓸모없어.',
        final_statement: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
      }),
    ).toEqual({ title: '회의 발표 사건', body: '한 번의 실수로 나의 가치를 판단할 수는 없다.' })
  })

  it('사건명이나 최종 진술문이 없으면 원래 생각으로 대신한다', () => {
    expect(buildPostContent({ title: null, thought: '나는 쓸모없어.' })).toEqual({
      title: '나는 쓸모없어.',
      body: '나는 쓸모없어.',
    })
  })

  it('제목은 120자, 본문은 2,000자를 넘지 않게 줄인다', () => {
    const content = buildPostContent({ title: 'a'.repeat(300), thought: 'b'.repeat(3000) })
    expect(content.title).toHaveLength(120)
    expect(content.title.endsWith('…')).toBe(true)
    expect(content.body).toHaveLength(2000)
  })
})

const NOW = Date.parse('2026-11-16T12:00:00Z')
const minutesAgo = (minutes) => new Date(NOW - minutes * 60 * 1000).toISOString()

describe('formatPostTime', () => {
  it('한 시간 안은 분, 하루 안은 시간으로 보여준다', () => {
    expect(formatPostTime(minutesAgo(5), NOW)).toBe('5m ago')
    expect(formatPostTime(minutesAgo(120), NOW)).toBe('2h ago')
  })

  it('하루가 넘으면 날짜로 보여준다', () => {
    expect(formatPostTime(minutesAgo(60 * 24 * 3), NOW)).toBe('Nov 13')
  })
})

describe('toPostView', () => {
  const post = {
    id: 'p1',
    title: '제목',
    body: '본문',
    visibility: VISIBILITY.public,
    created_at: minutesAgo(10),
    published_at: minutesAgo(5),
    like_count: 24,
    comment_count: 8,
    is_hot: true,
    is_mine: true,
  }

  it('목록 item을 화면용 모양으로 바꾼다', () => {
    expect(toPostView(post, NOW)).toMatchObject({
      id: 'p1',
      title: '제목',
      likes: 24,
      comments: 8,
      isHot: true,
      isMine: true,
      isLocked: false,
      timeLabel: '5m ago',
    })
  })

  it('게시 시각이 없으면 올린 시각으로 시간을 보여준다', () => {
    expect(toPostView({ ...post, published_at: null }, NOW).timeLabel).toBe('10m ago')
  })

  it('필드가 없으면 0과 false로 채운다', () => {
    const view = toPostView(
      { id: 'p2', title: 'a', visibility: 'public', created_at: post.created_at },
      NOW,
    )
    expect(view).toMatchObject({ likes: 0, comments: 0, isHot: false, isMine: false })
  })

  it('남의 비밀번호 글은 제목과 본문을 가린다', () => {
    const view = toPostView(
      { ...post, visibility: VISIBILITY.passwordProtected, is_mine: false },
      NOW,
    )
    expect(view).toMatchObject({ title: '비공개 글이에요', isLocked: true })
    expect(view.body).toBe('비밀번호가 필요합니다.')
  })

  it('내 비밀번호 글은 가리지 않는다', () => {
    const view = toPostView({ ...post, visibility: VISIBILITY.passwordProtected }, NOW)
    expect(view).toMatchObject({ title: '제목', isLocked: false })
  })
})
