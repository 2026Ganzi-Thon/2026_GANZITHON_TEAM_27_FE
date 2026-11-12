/**
 * 감정 선택지. 화면에 보이는 이름(`label`)과 API의 감정 `type`(`apiType`)을 짝짓는다.
 * 순서는 사건 접수 화면의 버튼 순서(왼쪽 위부터)다.
 *
 * TODO(API 확인 필요): 디자인의 "우울"에 대응하는 API 감정 type이 명세에 없다.
 * 임시로 `other`(기타)에 연결했다. 명세의 `sadness`(슬픔), `shame`(수치심), `guilt`(죄책감)은
 * 디자인의 "슬픔", "창피함", "자책"과 연결했다.
 */
export const EMOTIONS = [
  { key: 'anxiety', label: '불안', apiType: 'anxiety' },
  { key: 'depression', label: '우울', apiType: 'other' },
  { key: 'anger', label: '분노', apiType: 'anger' },
  { key: 'sadness', label: '슬픔', apiType: 'sadness' },
  { key: 'guilt', label: '자책', apiType: 'guilt' },
  { key: 'shame', label: '창피함', apiType: 'shame' },
]

/** API 감정 type으로 화면 이름을 찾는다. 모르는 type이면 "기타"를 돌려준다. */
export const getEmotionLabel = (apiType) =>
  EMOTIONS.find((emotion) => emotion.apiType === apiType)?.label ?? '기타'

/** 감정 강도 범위(0~100). */
export const EMOTION_INTENSITY_RANGE = { min: 0, max: 100, default: 40 }
