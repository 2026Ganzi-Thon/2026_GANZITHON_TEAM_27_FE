import { describe, expect, it } from 'vitest'
import {
  clampIntensity,
  getKeyboardIntensity,
  intensityToRatio,
  ratioToIntensity,
  toIntakeEmotion,
} from './utils'

describe('clampIntensity', () => {
  it('0~100 정수로 맞춘다', () => {
    expect(clampIntensity(-5)).toBe(0)
    expect(clampIntensity(140)).toBe(100)
    expect(clampIntensity(39.5)).toBe(40)
  })
})

describe('ratioToIntensity / intensityToRatio', () => {
  it('위치와 값은 비례한다', () => {
    expect(ratioToIntensity(0)).toBe(0)
    expect(ratioToIntensity(0.4)).toBe(40)
    expect(ratioToIntensity(1)).toBe(100)
    expect(intensityToRatio(40)).toBe(0.4)
  })

  it('바 바깥 위치는 끝값이 된다', () => {
    expect(ratioToIntensity(-0.3)).toBe(0)
    expect(ratioToIntensity(1.7)).toBe(100)
  })
})

describe('getKeyboardIntensity', () => {
  it('처리하는 키만 새 값을 돌려준다', () => {
    expect(getKeyboardIntensity('ArrowUp', 40)).toBe(41)
    expect(getKeyboardIntensity('ArrowDown', 40)).toBe(39)
    expect(getKeyboardIntensity('Home', 40)).toBe(0)
    expect(getKeyboardIntensity('End', 40)).toBe(100)
    expect(getKeyboardIntensity('Enter', 40)).toBeNull()
  })
})

describe('toIntakeEmotion', () => {
  it('사건 상세의 접수 감정(emotion)을 { type, intensity }로 꺼낸다', () => {
    expect(toIntakeEmotion({ id: 'c1', emotion: { type: 'anxiety', intensity: 35 } })).toEqual({
      type: 'anxiety',
      intensity: 35,
    })
    expect(toIntakeEmotion({ emotion: { type: 'shame', intensity: 0 } })).toEqual({
      type: 'shame',
      intensity: 0,
    })
  })

  it('감정을 입력하지 않았거나 사건이 없거나 모양이 맞지 않으면 null이다', () => {
    expect(toIntakeEmotion({ emotion: null })).toBeNull()
    expect(toIntakeEmotion({})).toBeNull()
    expect(toIntakeEmotion(null)).toBeNull()
    expect(toIntakeEmotion(undefined)).toBeNull()
    expect(toIntakeEmotion({ emotion: { type: 'anxiety' } })).toBeNull()
  })
})
