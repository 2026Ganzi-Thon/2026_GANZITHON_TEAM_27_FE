import { beforeEach, describe, expect, it } from 'vitest'
import { readMockCaseDecision } from '@/lib/mockCaseDecisions'
import { recordMockFinal } from './mocks/decisionMocks'

describe('판결 확정 목업(PUT decision/final)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('받은 판결 유형·최종 진술문·종결 감정을 사건별로 저장하고 종결 응답을 돌려준다', () => {
    const response = recordMockFinal('case-1', {
      decision_type: 'reframed',
      final_statement: '내가 고친 문장이다.',
      emotion_after: { type: 'anxiety', intensity: 30 },
    })

    expect(response).toEqual({ status: 'closed' })
    expect(readMockCaseDecision('case-1')).toEqual({
      decision: { type: 'reframed', final_statement: '내가 고친 문장이다.' },
      emotion_after: { type: 'anxiety', intensity: 30 },
      status: 'closed',
    })
  })

  it('판단 보류(진술문 없음)·감정 없음도 그대로 저장한다', () => {
    recordMockFinal('case-2', { decision_type: 'deferred' })
    expect(readMockCaseDecision('case-2')).toEqual({
      decision: { type: 'deferred', final_statement: null },
      emotion_after: null,
      status: 'closed',
    })
  })
})

describe('판결 확정 목업: 최종 진술문 위기 신호', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('최종 진술문에 위기 단어가 있으면 저장하지 않고 support_required를 돌려준다(접수 목업과 같은 기준)', () => {
    const response = recordMockFinal('case-risk', {
      decision_type: 'reframed',
      final_statement: '요즘은 정말 죽고 싶어요',
      emotion_after: { type: 'anxiety', intensity: 30 },
    })

    expect(response.outcome).toBe('support_required')
    expect(response.support.contacts.length).toBeGreaterThan(0)
    expect(readMockCaseDecision('case-risk')).toBeNull()
    expect(JSON.stringify({ ...localStorage })).not.toContain('죽고')
  })
})
