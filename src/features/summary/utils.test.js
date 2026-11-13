import { describe, expect, it } from 'vitest'
import { formatEmotionChange, intensityToChartY, toSummaryView, withSubjectParticle } from './utils'

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
  const detail = {
    case_number: '2026-031',
    thought: '나는 왜 자꾸 불안할까?',
    case_type: '과도한 자기비판',
    emotion: { type: 'anxiety', intensity: 80 },
    emotion_after: { type: 'anxiety', intensity: 40 },
    decision: { final_statement: '그럴 수 있다.' },
  }

  it('사건 상세를 화면 값으로 바꾼다', () => {
    expect(toSummaryView(detail)).toEqual({
      caseNumber: '2026-031',
      thought: '나는 왜 자꾸 불안할까?',
      finalStatement: '그럴 수 있다.',
      caseType: '과도한 자기비판',
      emotion: {
        label: '불안',
        before: 80,
        after: 40,
        sentence: '재판을 통해, 불안이 40% 줄어들었어요.',
      },
    })
  })

  it('접수·종결 감정 type이 다르거나 없으면 비교하지 않는다', () => {
    expect(
      toSummaryView({ ...detail, emotion_after: { type: 'anger', intensity: 40 } }).emotion,
    ).toBeNull()
    expect(toSummaryView({ ...detail, emotion: null }).emotion).toBeNull()
  })
})
