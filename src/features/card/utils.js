import { getEmotionLabel } from '@/constants/emotions'

/**
 * 사건번호를 카드에 쓰는 짧은 모양으로 바꾼다. 예: `2026-000031` → `#2026-031`
 * @param {string} caseNumber API 사건번호
 * @returns {string}
 */
export const formatCardNumber = (caseNumber) => {
  const [year, sequence] = String(caseNumber).split('-')
  if (!year || !sequence) return `#${caseNumber}`
  return `#${year}-${String(Number(sequence)).padStart(3, '0')}`
}

/**
 * 카드의 감정 변화 문구. 종결 때 같은 감정을 기록했으면 `불안 70% → 40%`, 아니면 접수 때 감정만 보여준다.
 * TODO(API 확인 필요): `emotion`, `emotion_after` 응답 구조가 확정되면 맞춘다.
 */
const formatCardEmotion = ({ emotion, emotion_after: emotionAfter }) => {
  if (!emotion) return '감정 기록 없음'
  const label = getEmotionLabel(emotion.type)
  const canCompare = emotionAfter?.type === emotion.type
  return canCompare
    ? `${label} ${emotion.intensity}% → ${emotionAfter.intensity}%`
    : `${label} ${emotion.intensity}%`
}

/** 문장을 큰따옴표로 감싼다. 비어 있으면 안내 문구를 대신 쓴다. */
const quote = (text, emptyText) => (text ? `“${text}”` : emptyText)

/**
 * API 사건을 카드에 들어갈 문구로 바꾼다.
 *
 * TODO(피그마 확인 필요): API 명세는 카드에 사건번호·원문·감정 수치를 기본으로 넣지 않고 사용자가 고른 문장만 넣으라고 하지만,
 * 디자인은 이 값들을 기본으로 보여준다. 어느 쪽이 맞는지 확인한다.
 * TODO(API 확인 필요): 종결 전 사건은 `final_statement`가 없다. 종결 전에도 이 화면에 들어올 수 있는지 확인한다.
 *
 * @param {object} caseItem API 사건 item
 * @returns {{ number: string, thought: string, finalStatement: string, emotionChange: string }}
 */
export const buildCardContent = (caseItem) => ({
  number: formatCardNumber(caseItem.case_number),
  thought: quote(caseItem.thought, '“원래 생각이 없어요.”'),
  finalStatement: quote(caseItem.final_statement, '아직 확정된 최종 진술문이 없어요.'),
  emotionChange: formatCardEmotion(caseItem),
})

/**
 * 카드 이미지의 파일 이름. 예: `사건카드-2026-031.png`
 * @param {{ number: string }} content `buildCardContent`의 결과
 */
export const getCardFileName = (content) => `사건카드-${content.number.replace('#', '')}.png`

/**
 * 스크린 리더용으로 카드 내용을 한 문장으로 풀어 쓴다.
 * @param {ReturnType<typeof buildCardContent>} content
 */
export const getCardDescription = (content) =>
  `사건 카드 ${content.number}. 원래 생각 ${content.thought}. 최종 진술문 ${content.finalStatement}. 감정 변화 ${content.emotionChange}.`
