import { getEmotionLabel } from '@/constants/emotions'

/**
 * 감정 그래프 세로축: 눈금 글자 가운데 y(Figma 화면 좌표) — 100 → 533, 50 → 600, 0 → 667.
 * 값 1당 1.34px로, 값과 점 위치가 눈금에 비례하도록 이 기준으로 그린다.
 * (Figma의 점은 80 → 558.5, 40 → 618.5로 1당 1.5px 간격이라 눈금과 맞지 않는다. 디자이너 확인 필요)
 */
export const CHART_Y_AT_0 = 667
export const CHART_Y_AT_100 = 533

/**
 * 감정 강도를 그래프 점 중심의 y 좌표(Figma 화면 좌표)로 바꾼다. 0~100 밖의 값은 끝값으로 맞춘다.
 * @param {number} intensity 감정 강도 0~100
 * @returns {number} y 좌표
 */
export const intensityToChartY = (intensity) => {
  const value = Math.min(100, Math.max(0, intensity))
  return CHART_Y_AT_0 - ((CHART_Y_AT_0 - CHART_Y_AT_100) * value) / 100
}

/**
 * 단어 끝 글자에 받침이 있으면 `이`, 없으면 `가`를 붙인다. (예: 불안이, 분노가)
 * @param {string} word 단어
 * @returns {string} 조사를 붙인 단어
 */
export const withSubjectParticle = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0
  return `${word}${hasBatchim ? '이' : '가'}`
}

/**
 * 감정 변화 문장. Figma 문구는 줄어든 경우("재판을 통해, 불안이 40% 줄어들었어요.")뿐이다.
 * TODO(피그마 확인 필요): 늘었거나 같을 때의 문구가 디자인에 없어 최소 문구로 둔다.
 * @param {string} label 감정 이름 (예: '불안')
 * @param {number} before 재판 전 강도
 * @param {number} after 재판 후 강도
 * @returns {string}
 */
export const formatEmotionChange = (label, before, after) => {
  const subject = withSubjectParticle(label)
  const diff = Math.abs(before - after)
  if (after < before) return `재판을 통해, ${subject} ${diff}% 줄어들었어요.`
  if (after > before) return `재판을 통해, ${subject} ${diff}% 늘어났어요.`
  return `재판 전과 후의 ${label} 강도가 같아요.`
}

/**
 * API 사건 상세를 화면에서 쓰는 모양으로 바꾼다.
 * 감정 비교는 접수·종결에 같은 감정 type을 기록했을 때만 한다(docs/api-spec.md §6.5).
 * TODO(API 확인 필요): 사건 상세 응답 필드가 확정되면 이 함수만 고친다.
 *
 * @param {object} detail API 사건 상세
 * @returns {{
 *   caseNumber: string | null,
 *   thought: string,
 *   finalStatement: string,
 *   caseType: string,
 *   emotion: { label: string, before: number, after: number, sentence: string } | null,
 * }}
 */
export const toSummaryView = (detail) => {
  const before = detail.emotion
  const after = detail.emotion_after
  const canCompare = Boolean(before && after && before.type === after.type)
  const label = canCompare ? getEmotionLabel(before.type) : null

  return {
    caseNumber: detail.case_number ?? null,
    thought: detail.thought ?? '',
    finalStatement: detail.decision?.final_statement ?? '',
    caseType: detail.case_type ?? '',
    emotion: canCompare
      ? {
          label,
          before: before.intensity,
          after: after.intensity,
          sentence: formatEmotionChange(label, before.intensity, after.intensity),
        }
      : null,
  }
}
