import { describe, expect, it } from 'vitest'
import {
  canSimplify,
  findOpenQuestion,
  getDefenseErrorState,
  SUGGESTION_OPTIONS,
  toChatMessages,
} from './utils'

const q = (id) => ({ id, sequence: 1, prompt: `질문 ${id}`, revision: 0 })

describe('defense utils', () => {
  it('질문 다음에 내 답을 말풍선으로 만들고, 건너뛰기·떠오르지 않아요는 그 문구를 내 말풍선으로 보여준다', () => {
    const messages = toChatMessages([
      { question: q('1'), answer: { action: 'answer', text: '답 1' } },
      { question: q('2'), answer: { action: 'skip' } },
      { question: q('3'), answer: { action: 'not_sure' } },
      { question: q('4'), answer: null },
    ])
    expect(messages.map(({ from, text }) => [from, text])).toEqual([
      ['ai', '질문 1'],
      ['me', '답 1'],
      ['ai', '질문 2'],
      ['me', '이 질문 건너뛰기'],
      ['ai', '질문 3'],
      ['me', '떠오르지 않아요.'],
      ['ai', '질문 4'],
    ])
  })

  it('쉽게 바꾼 문장은 기존 질문 다음에 새 AI 말풍선으로 붙는다', () => {
    const messages = toChatMessages([
      { question: { ...q('1'), simplifiedPrompts: ['쉬운 1', '더 쉬운 1'] }, answer: null },
    ])
    expect(messages.map(({ from, text }) => [from, text])).toEqual([
      ['ai', '질문 1'],
      ['ai', '쉬운 1'],
      ['ai', '더 쉬운 1'],
    ])
  })

  it('쉽게 바꾸기는 질문당 2회까지만 할 수 있다', () => {
    expect(canSimplify(q('1'))).toBe(true)
    expect(canSimplify({ ...q('1'), simplifiedPrompts: ['a'] })).toBe(true)
    expect(canSimplify({ ...q('1'), simplifiedPrompts: ['a', 'b'] })).toBe(false)
    expect(canSimplify(null)).toBe(false)
  })

  it('추천 질문 보기는 Figma 문구 그대로 3개다', () => {
    expect(SUGGESTION_OPTIONS.map((option) => option.label)).toEqual([
      '질문을 쉽게 바꿔주세요.',
      '떠오르지 않아요.',
      '이 질문 건너뛰기',
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

  it('422(입력 오류)는 다시 시도하지 않고 입력을 확인하라고 안내한다', () => {
    expect(getDefenseErrorState({ response: { status: 422 } })).toEqual({
      message: '입력한 내용을 확인해 주세요.',
      canRetry: false,
    })
  })
})
