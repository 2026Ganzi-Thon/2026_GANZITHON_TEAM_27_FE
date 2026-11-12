import { describe, expect, it } from 'vitest'
import { formatCardDate, formatDotDate, toCaseView } from './utils'

const baseCase = {
  id: 'case-1',
  title: null,
  thought: '회의에서 발표를 망쳤다',
  emotion: { type: 'anxiety', intensity: 80 },
  emotion_after: null,
  status: 'received',
  created_at: '2026-07-20T03:00:00.000Z',
}

describe('날짜 문구', () => {
  it('카드용 날짜를 `July 20,2026` 형태로 만든다', () => {
    expect(formatCardDate('2026-07-20T03:00:00.000Z')).toBe('July 20,2026')
  })

  it('진행 중 카드용 날짜를 `2026.07.20` 형태로 만든다', () => {
    expect(formatDotDate('2026-07-20T03:00:00.000Z')).toBe('2026.07.20')
  })

  it('한국 시간 기준으로 날짜를 계산한다', () => {
    // UTC 7월 19일 16시는 한국 시간으로 7월 20일 오전 1시다.
    expect(formatDotDate('2026-07-19T16:00:00.000Z')).toBe('2026.07.20')
  })
})

describe('toCaseView', () => {
  it('접수 직후 사건은 진행 중이고, 접수 때 감정만 보여준다', () => {
    const view = toCaseView(baseCase)
    expect(view.isInProgress).toBe(true)
    expect(view.statusLabel).toBe('진행중')
    expect(view.emotionChange).toBe('불안 80')
  })

  it('사건명이 없으면 생각의 앞부분을 임시 제목으로 쓴다', () => {
    const longThought = '오늘 회의에서 발표를 망쳤고 다들 나를 한심하게 봤을 거야'
    expect(toCaseView({ ...baseCase, thought: longThought }).title).toBe(
      '오늘 회의에서 발표를 망쳤…',
    )
    expect(toCaseView({ ...baseCase, title: '회의 발표 사건' }).title).toBe('회의 발표 사건')
  })

  it('종결된 사건에서 같은 감정이면 `접수 → 종결` 변화를 보여준다', () => {
    const closed = {
      ...baseCase,
      status: 'closed',
      emotion_after: { type: 'anxiety', intensity: 40 },
    }
    const view = toCaseView(closed)
    expect(view.isInProgress).toBe(false)
    expect(view.emotionChange).toBe('불안 80 → 40')
  })

  it('종결 때 감정 종류가 다르면 변화를 비교하지 않는다', () => {
    const closed = {
      ...baseCase,
      status: 'closed',
      emotion_after: { type: 'sadness', intensity: 40 },
    }
    expect(toCaseView(closed).emotionChange).toBe('불안 80')
  })

  it('감정 기록이 없으면 안내 문구를 보여준다', () => {
    expect(toCaseView({ ...baseCase, emotion: null }).emotionChange).toBe('감정 기록 없음')
  })
})
