import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'

const { min: MIN, max: MAX } = EMOTION_INTENSITY_RANGE

/**
 * 강도를 0~100 사이 정수로 맞춘다. 범위를 넘으면 끝값으로 고정한다.
 * @param {number} value 강도
 * @returns {number} 0~100 정수
 */
export const clampIntensity = (value) => Math.min(MAX, Math.max(MIN, Math.round(value)))

/**
 * 바 위의 위치 비율(0=왼쪽 끝, 1=오른쪽 끝)을 강도로 바꾼다. 값과 위치는 비례한다.
 * @param {number} ratio 위치 비율 (범위를 넘어도 된다)
 * @returns {number} 0~100 정수
 */
export const ratioToIntensity = (ratio) => clampIntensity(MIN + ratio * (MAX - MIN))

/**
 * 강도를 바 위의 위치 비율(0~1)로 바꾼다.
 * @param {number} value 강도
 * @returns {number} 0~1
 */
export const intensityToRatio = (value) => (clampIntensity(value) - MIN) / (MAX - MIN)

/**
 * 키보드 입력에 따른 다음 강도. 슬라이더가 처리하지 않는 키면 null.
 * ←·↓ 1 감소, →·↑ 1 증가, Home 최솟값, End 최댓값.
 * @param {string} key KeyboardEvent.key
 * @param {number} value 현재 강도
 * @returns {number | null}
 */
export const getKeyboardIntensity = (key, value) => {
  if (key === 'ArrowLeft' || key === 'ArrowDown') return clampIntensity(value - 1)
  if (key === 'ArrowRight' || key === 'ArrowUp') return clampIntensity(value + 1)
  if (key === 'Home') return MIN
  if (key === 'End') return MAX
  return null
}
