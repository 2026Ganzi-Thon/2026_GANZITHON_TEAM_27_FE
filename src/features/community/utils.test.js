import { describe, expect, it } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import { buildPostContent, canPost, validatePostPassword } from './utils'

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
