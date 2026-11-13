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

/**
 * 사건 상세에서 접수 당시 감정을 꺼낸다. 응답 필드 이름은 이 함수 한 곳에서만 다룬다.
 * 지금은 접수 요청(`POST /cases`)과 동료의 사건 조회(useCase)가 쓰는 `emotion: { type, intensity }`를 읽는다.
 * TODO(API 확인 필요): 사건 상세 응답의 접수 감정 필드 이름(emotion / emotion_before)과 모양이 확정되면 여기만 고친다.
 * @param {object | null | undefined} caseItem 사건 상세
 * @returns {{type: string, intensity: number} | null} 접수 때 감정을 입력하지 않았거나 사건이 없으면 null
 */
export const toIntakeEmotion = (caseItem) => {
  const emotion = caseItem?.emotion
  if (!emotion?.type || typeof emotion.intensity !== 'number') return null
  return { type: emotion.type, intensity: emotion.intensity }
}
