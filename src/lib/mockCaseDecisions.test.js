import { beforeEach, describe, expect, it } from 'vitest'
import { readMockCaseDecision, saveMockCaseDecision } from './mockCaseDecisions'

describe('법정 진행 결과 목업 저장소', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('사건 ID별로 저장하고, 같은 사건에는 값을 덧붙인다', () => {
    saveMockCaseDecision('case-1', { pattern_tags: ['labeling'] })
    saveMockCaseDecision('case-1', {
      decision: { type: 'reframed', final_statement: '다음엔 더 잘할 수 있다.' },
      emotion_after: { type: 'anxiety', intensity: 30 },
      status: 'closed',
    })
    saveMockCaseDecision('case-2', { pattern_tags: ['mind_reading'] })

    expect(readMockCaseDecision('case-1')).toEqual({
      pattern_tags: ['labeling'],
      decision: { type: 'reframed', final_statement: '다음엔 더 잘할 수 있다.' },
      emotion_after: { type: 'anxiety', intensity: 30 },
      status: 'closed',
    })
    expect(readMockCaseDecision('case-2')).toEqual({ pattern_tags: ['mind_reading'] })
    expect(readMockCaseDecision('none')).toBeNull()
  })

  it('동료의 사건 접수 저장소(mock-case-files)는 건드리지 않는다', () => {
    localStorage.setItem('mock-case-files', '[{"id":"case-1"}]')
    saveMockCaseDecision('case-1', { pattern_tags: [] })
    expect(localStorage.getItem('mock-case-files')).toBe('[{"id":"case-1"}]')
    expect(Object.keys(localStorage)).toEqual(
      expect.arrayContaining(['mock-case-files', 'mock-case-decisions']),
    )
  })

  it('저장 내용이 깨져 있어도 빈 기록으로 읽는다', () => {
    localStorage.setItem('mock-case-decisions', '{broken')
    expect(readMockCaseDecision('case-1')).toBeNull()
    expect(saveMockCaseDecision('case-1', { pattern_tags: ['labeling'] })).toEqual({
      pattern_tags: ['labeling'],
    })
  })
})
