import { beforeEach, describe, expect, it } from 'vitest'
import { readMockCaseDecision } from '@/lib/mockCaseDecisions'
import { recordMockEvidence } from './mocks/prosecutionMocks'

describe('증거 확정 목업(PUT evidence)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('확정한 사고 패턴을 사건별로 저장한다', () => {
    recordMockEvidence('case-1', { claim: '...', pattern_tags: ['all_or_nothing', 'labeling'] })
    expect(readMockCaseDecision('case-1')).toEqual({ pattern_tags: ['all_or_nothing', 'labeling'] })
  })
})
