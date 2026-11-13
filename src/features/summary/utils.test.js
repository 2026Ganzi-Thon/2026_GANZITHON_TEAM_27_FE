import { describe, expect, it } from 'vitest'
import { readMockCaseDecision, saveMockCaseDecision } from '@/lib/mockCaseDecisions'
import {
  DEFERRED_STATEMENT,
  NO_PATTERN,
  formatEmotionChange,
  intensityToChartY,
  toSummaryView,
  withSubjectParticle,
} from './utils'

describe('intensityToChartY', () => {
  it('눈금 글자 위치(100 → 533, 50 → 600, 0 → 667)에 비례한다', () => {
    expect(intensityToChartY(100)).toBe(533)
    expect(intensityToChartY(50)).toBe(600)
    expect(intensityToChartY(0)).toBe(667)
    expect(intensityToChartY(80)).toBeCloseTo(559.8)
    expect(intensityToChartY(40)).toBeCloseTo(613.4)
  })

  it('0~100 밖의 값은 끝값으로 맞춘다', () => {
    expect(intensityToChartY(-10)).toBe(667)
    expect(intensityToChartY(150)).toBe(533)
  })
})

describe('withSubjectParticle', () => {
  it('받침이 있으면 이, 없으면 가를 붙인다', () => {
    expect(withSubjectParticle('불안')).toBe('불안이')
    expect(withSubjectParticle('분노')).toBe('분노가')
    expect(withSubjectParticle('창피함')).toBe('창피함이')
    expect(withSubjectParticle('기타')).toBe('기타가')
  })
})

describe('formatEmotionChange', () => {
  it('줄었을 때 Figma 문구와 같다', () => {
    expect(formatEmotionChange('불안', 80, 40)).toBe('재판을 통해, 불안이 40% 줄어들었어요.')
  })

  it('늘었거나 같을 때도 문장을 만든다', () => {
    expect(formatEmotionChange('분노', 30, 50)).toBe('재판을 통해, 분노가 20% 늘어났어요.')
    expect(formatEmotionChange('불안', 50, 50)).toBe('재판 전과 후의 불안 강도가 같아요.')
  })
})

describe('toSummaryView', () => {
  // 사건 접수 정보(동료 useCase)
  const intake = {
    case_number: '2026-000007',
    thought: '회의에서 발표를 망쳐서 나는 쓸모없는 사람 같다',
    emotion: { type: 'anxiety', intensity: 80 },
  }
  // 법정 진행 결과(증거 확정·판결 확정)
  const result = {
    pattern_tags: ['labeling', 'all_or_nothing'],
    decision: { type: 'reframed', final_statement: '내가 고친 문장이다.' },
    emotion_after: { type: 'anxiety', intensity: 30 },
  }

  it('접수 정보와 법정 진행 결과를 합쳐 화면 값으로 바꾼다', () => {
    expect(toSummaryView(intake, result)).toEqual({
      caseNumber: '2026-000007',
      thought: '회의에서 발표를 망쳐서 나는 쓸모없는 사람 같다',
      finalStatement: '내가 고친 문장이다.',
      caseType: '낙인 찍기',
      emotion: {
        label: '불안',
        before: 80,
        after: 30,
        sentence: '재판을 통해, 불안이 50% 줄어들었어요.',
      },
    })
  })

  it('사건 유형은 확정한 패턴 중 첫 번째 하나만 이름으로 보여준다', () => {
    expect(toSummaryView(intake, { ...result, pattern_tags: ['mind_reading'] }).caseType).toBe(
      '독심술',
    )
    expect(toSummaryView(intake, { ...result, pattern_tags: [] }).caseType).toBe(NO_PATTERN)
    expect(toSummaryView(intake, null).caseType).toBe(NO_PATTERN)
  })

  it('판단 보류로 진술문 없이 확정하면 보류 문구를 보여준다', () => {
    expect(
      toSummaryView(intake, { ...result, decision: { type: 'deferred', final_statement: null } })
        .finalStatement,
    ).toBe(DEFERRED_STATEMENT)
    expect(toSummaryView(intake, null).finalStatement).toBe('')
  })

  it('감정 요약 문장은 줄어듦·늘어남·같음을 구분한다', () => {
    const at = (after) =>
      toSummaryView(intake, { ...result, emotion_after: { type: 'anxiety', intensity: after } })
        .emotion.sentence
    expect(at(30)).toBe('재판을 통해, 불안이 50% 줄어들었어요.')
    expect(at(95)).toBe('재판을 통해, 불안이 15% 늘어났어요.')
    expect(at(80)).toBe('재판 전과 후의 불안 강도가 같아요.')
  })

  it('접수·종결 감정이 없거나 type이 다르면 비교하지 않는다', () => {
    expect(
      toSummaryView(intake, { ...result, emotion_after: { type: 'anger', intensity: 40 } }).emotion,
    ).toBeNull()
    expect(toSummaryView({ ...intake, emotion: null }, result).emotion).toBeNull()
    expect(toSummaryView(intake, { ...result, emotion_after: null }).emotion).toBeNull()
  })
})

describe('목업 저장소 기록 → 사건요약', () => {
  it('증거 확정·판결 확정 목업이 남긴 기록을 그대로 읽어 화면 값을 만든다', () => {
    localStorage.clear()
    // 판결 확정 목업(recordMockFinal)·증거 확정 목업(recordMockEvidence)이 남기는 모양 그대로
    saveMockCaseDecision('case-9', { pattern_tags: ['catastrophizing', 'labeling'] })
    saveMockCaseDecision('case-9', {
      decision: { type: 'reframed', final_statement: '수정한 최종 진술문' },
      emotion_after: { type: 'sadness', intensity: 30 },
      status: 'closed',
    })
    const view = toSummaryView(
      {
        case_number: '2026-000009',
        thought: '접수 글',
        emotion: { type: 'sadness', intensity: 80 },
      },
      readMockCaseDecision('case-9'),
    )

    expect(view.finalStatement).toBe('수정한 최종 진술문')
    expect(view.caseType).toBe('파국화')
    expect(view.emotion).toEqual({
      label: '슬픔',
      before: 80,
      after: 30,
      sentence: '재판을 통해, 슬픔이 50% 줄어들었어요.',
    })
  })
})
