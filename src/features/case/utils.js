import { getEmotionLabel } from '@/constants/emotions'

const SEOUL = 'Asia/Seoul'

/** 카드용 날짜. 예: `July 20,2026` */
export const formatCardDate = (iso) => {
  const date = new Date(iso)
  const monthDay = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: SEOUL,
  })
  const year = date.toLocaleDateString('en-US', { year: 'numeric', timeZone: SEOUL })
  return `${monthDay},${year}`
}

/** 진행 중 카드용 날짜. 예: `2026.11.06` */
export const formatDotDate = (iso) =>
  new Date(iso).toLocaleDateString('sv-SE', { timeZone: SEOUL }).replaceAll('-', '.')

/**
 * 감정 문구. 종결된 사건에서 접수와 종결의 감정이 같으면 `불안 80 → 40`, 아니면 접수 때 감정만 `불안 80`으로 보여준다.
 * TODO(API 확인 필요): `emotion`, `emotion_after` 응답 구조가 확정되면 맞춘다.
 */
const formatEmotion = ({ emotion, emotion_after: emotionAfter, status }) => {
  if (!emotion) return '감정 기록 없음'
  const label = getEmotionLabel(emotion.type)
  const canCompare = status === 'closed' && emotionAfter?.type === emotion.type
  return canCompare
    ? `${label} ${emotion.intensity} → ${emotionAfter.intensity}`
    : `${label} ${emotion.intensity}`
}

/** 접수 직후에는 사건명이 없으므로 생각의 앞부분을 임시 제목으로 쓴다. */
const getTitle = ({ title, thought }) => {
  if (title) return title
  const oneLine = thought.replace(/\s+/g, ' ').trim()
  return oneLine.length > 14 ? `${oneLine.slice(0, 14)}…` : oneLine
}

/**
 * API 사건 item을 화면에서 쓰는 모양으로 바꾼다.
 * TODO(API 확인 필요): 목록 item 필드 구조가 확정되면 이 함수만 고친다.
 *
 * @param {object} item API 사건 item
 * @returns {{ id: string, title: string, dateLabel: string, dotDate: string, emotionChange: string, statusLabel: string, isInProgress: boolean }}
 */
export const toCaseView = (item) => ({
  id: item.id,
  title: getTitle(item),
  dateLabel: formatCardDate(item.created_at),
  dotDate: formatDotDate(item.created_at),
  emotionChange: formatEmotion(item),
  statusLabel: item.status === 'closed' ? '종결' : '진행중',
  isInProgress: item.status !== 'closed' && item.status !== 'support_required',
})
