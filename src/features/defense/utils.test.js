import { describe, expect, it } from 'vitest'
import { findOpenQuestion, getDefenseErrorState, toChatMessages } from './utils'

const q = (id) => ({ id, sequence: 1, prompt: `질문 ${id}`, revision: 0 })

describe('defense utils', () => {
  it('질문 다음에 내 답을 말풍선으로 만들고, 글이 없는 답은 건너뛴다', () => {
    const messages = toChatMessages([
      { question: q('1'), answer: { action: 'answer', text: '답 1' } },
      { question: q('2'), answer: { action: 'skip' } },
      { question: q('3'), answer: null },
    ])
    expect(messages.map(({ from, text }) => [from, text])).toEqual([
      ['ai', '질문 1'],
      ['me', '답 1'],
      ['ai', '질문 2'],
      ['ai', '질문 3'],
    ])
  })

  it('답하지 않은 질문을 찾고, 없으면 null을 돌려준다', () => {
    expect(findOpenQuestion([{ question: q('1'), answer: null }])?.id).toBe('1')
    expect(findOpenQuestion([{ question: q('1'), answer: { action: 'skip' } }])).toBeNull()
  })

  it('상태 코드에 따라 문구와 재시도 가능 여부를 정한다', () => {
    const at = (status) => ({ response: { status } })
    expect(getDefenseErrorState(at(404)).canRetry).toBe(false)
    expect(getDefenseErrorState(at(502)).canRetry).toBe(true)
    expect(getDefenseErrorState(at(409)).message).toContain('질문이 바뀌었어요')
  })
})
