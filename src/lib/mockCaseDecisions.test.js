import { beforeEach, describe, expect, it } from 'vitest'
import {
  advanceMockCaseStatus,
  readMockCaseDecision,
  readMockCaseProgress,
  saveMockCaseDecision,
} from './mockCaseDecisions'

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

describe('advanceMockCaseStatus', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('사건 상태를 단계 순서대로 앞으로 옮기고 함께 남긴 값도 저장한다', () => {
    advanceMockCaseStatus('case-1', 'evidence_review', { title: '회의 발표 사건' })
    advanceMockCaseStatus('case-1', 'defense')

    expect(readMockCaseProgress('case-1')).toEqual({ status: 'defense', title: '회의 발표 사건' })
  })

  it('이미 더 나아간 상태로는 되돌리지 않는다', () => {
    advanceMockCaseStatus('case-1', 'decision_review')
    advanceMockCaseStatus('case-1', 'evidence_review', { title: '덮어쓰면 안 되는 제목' })

    expect(readMockCaseProgress('case-1')).toEqual({ status: 'decision_review' })
  })

  it('법정 진행 기록(판결·패턴)과 섞이지 않는다', () => {
    saveMockCaseDecision('case-1', { pattern_tags: ['labeling'] })
    advanceMockCaseStatus('case-1', 'defense')

    expect(readMockCaseDecision('case-1')).toEqual({ pattern_tags: ['labeling'] })
  })
})
