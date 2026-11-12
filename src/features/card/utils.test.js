import { describe, expect, it } from 'vitest'
import { buildCardContent, formatCardNumber, getCardDescription, getCardFileName } from './utils'

const baseCase = {
  case_number: '2026-000031',
  thought: '나는 쓸모없어.',
  final_statement: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
  emotion: { type: 'anxiety', intensity: 70 },
  emotion_after: { type: 'anxiety', intensity: 40 },
}

describe('formatCardNumber', () => {
  it('앞자리 0을 줄여서 `#2026-031` 모양으로 만든다', () => {
    expect(formatCardNumber('2026-000031')).toBe('#2026-031')
    expect(formatCardNumber('2026-000007')).toBe('#2026-007')
  })

  it('형식이 다르면 그대로 `#`만 붙인다', () => {
    expect(formatCardNumber('abc')).toBe('#abc')
  })
})

describe('buildCardContent', () => {
  it('시안처럼 큰따옴표로 감싼 문장과 감정 변화를 만든다', () => {
    expect(buildCardContent(baseCase)).toEqual({
      number: '#2026-031',
      thought: '“나는 쓸모없어.”',
      finalStatement: '“한 번의 실수로 나의 가치를 판단할 수는 없다.”',
      emotionChange: '불안 70% → 40%',
    })
  })

  it('종결 때 감정 종류가 다르면 접수 때 감정만 보여준다', () => {
    const content = buildCardContent({
      ...baseCase,
      emotion_after: { type: 'sadness', intensity: 40 },
    })
    expect(content.emotionChange).toBe('불안 70%')
  })

  it('최종 진술문이 없으면 안내 문구를 보여준다', () => {
    const content = buildCardContent({ ...baseCase, final_statement: undefined })
    expect(content.finalStatement).toBe('아직 확정된 최종 진술문이 없어요.')
  })

  it('감정 기록이 없으면 안내 문구를 보여준다', () => {
    expect(buildCardContent({ ...baseCase, emotion: null }).emotionChange).toBe('감정 기록 없음')
  })
})

describe('카드 파일 이름과 설명', () => {
  it('파일 이름에 사건번호를 넣는다', () => {
    expect(getCardFileName(buildCardContent(baseCase))).toBe('사건카드-2026-031.png')
  })

  it('스크린 리더용 설명에 카드 내용이 모두 들어 있다', () => {
    const description = getCardDescription(buildCardContent(baseCase))
    expect(description).toContain('#2026-031')
    expect(description).toContain('나는 쓸모없어.')
    expect(description).toContain('불안 70% → 40%')
  })
})
