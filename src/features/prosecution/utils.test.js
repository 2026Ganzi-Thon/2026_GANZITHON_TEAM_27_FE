import { describe, expect, it } from 'vitest'
import { getProsecutionErrorState, toEvidencePayload, toProsecutionView } from './utils'

describe('prosecution utils', () => {
  it('사고 패턴 enum을 표시 이름으로 바꾸고, 모르는 값은 그대로 둔다', () => {
    const view = toProsecutionView({
      title: '사건',
      claim: '주장',
      pattern_candidates: ['mind_reading', 'unknown_pattern'],
      evidence: [],
    })
    expect(view.patterns).toEqual(['독심술', 'unknown_pattern'])
  })

  it('빠진 필드는 빈 값으로 채운다', () => {
    expect(toProsecutionView({})).toEqual({ title: '', claim: '', patterns: [], evidence: [] })
  })

  it('초안을 증거 확정 요청 본문으로 바꾸고 증거는 type·text만 보낸다', () => {
    const payload = toEvidencePayload({
      claim: '주장',
      pattern_candidates: ['labeling'],
      evidence: [{ id: 'e1', type: 'observed', text: '근거' }],
    })
    expect(payload).toEqual({
      claim: '주장',
      pattern_tags: ['labeling'],
      evidence: [{ type: 'observed', text: '근거' }],
    })
  })

  it('상태 코드에 따라 문구와 재시도 가능 여부를 정한다', () => {
    const at = (status, message) => ({ response: { status, data: { error: { message } } } })
    expect(getProsecutionErrorState(at(404)).canRetry).toBe(false)
    expect(getProsecutionErrorState(at(409)).canRetry).toBe(false)
    expect(getProsecutionErrorState(at(503)).canRetry).toBe(true)
    expect(getProsecutionErrorState(at(500, '서버 메시지')).message).toBe('서버 메시지')
    expect(getProsecutionErrorState(new Error('network')).canRetry).toBe(true)
  })

  it('422(입력 오류)는 다시 시도하지 않고 입력을 확인하라고 안내한다', () => {
    const state = getProsecutionErrorState({ response: { status: 422 } })
    expect(state).toEqual({ message: '입력한 내용을 확인해 주세요.', canRetry: false })
  })
})
