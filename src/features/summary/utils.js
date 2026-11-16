import { getEmotionLabel } from '@/constants/emotions'
import { getThoughtPatternLabel } from '@/constants/thoughtPatterns'

/**
 * 감정 그래프 세로축: 눈금 글자 가운데 y(Figma 화면 좌표) — 100 → 533, 50 → 600, 0 → 667.
 * 값 1당 1.34px로, 값과 점 위치가 눈금에 비례하도록 이 기준으로 그린다.
 * (Figma의 점은 80 → 558.5, 40 → 618.5로 1당 1.5px 간격이라 눈금과 맞지 않는다. 디자이너 확인 필요)
 */
/** 사건요약 화면의 감정 변화 그래프 위치 이름. 주소 끝 `#emotion`으로 열면 그래프로 바로 스크롤한다. */
export const SUMMARY_EMOTION_SECTION = 'emotion'

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

/** 판단 보류(`deferred`)로 진술문 없이 확정했을 때 "최종판결" 칸 문구 */
export const DEFERRED_STATEMENT = '판단을 보류했어요.'
/** 확정한 사고 패턴이 없을 때 "사건 유형" 칸 문구 */
export const NO_PATTERN = '찾은 사고 패턴이 없어요.'

/**
 * 사건요약 화면에서 쓰는 모양으로 바꾼다. 접수 정보와 법정 진행 결과를 합치는 일은 이 함수 한 곳에서만 한다.
 * 지금(목업)은 둘이 따로 오지만, 서버가 붙으면 `GET /cases/{caseId}` 응답 하나를 두 인자에 같이 넘기면 된다.
 * 감정 비교는 접수·종결에 같은 감정 type을 기록했을 때만 한다(docs/api-spec.md §6.5).
 *
 * - 처음 든 생각: 접수 글(`thought`). 카드가 한 줄로 보여주고 넘치면 말줄임한다.
 *   TODO(API 확인 필요: 처음 든 생각 한 줄 요약 필드. claim인지 새 필드인지) AI 한 줄 요약 필드가 생기면 그 값을 쓴다.
 * - 최종판결: 판결 화면에서 확정한 진술문(`decision.final_statement`, 직접 고쳤으면 고친 문장).
 *   TODO(API 확인 필요): `GET /cases/{caseId}` 응답의 `decision.final_statement` 이름을 확인한다.
 *   TODO(피그마 확인 필요): 판단 보류로 진술문 없이 확정했을 때의 표시 디자인이 없다(최소 문구).
 * - 사건 유형: 확정한 사고 패턴(`pattern_tags`) 중 첫 번째 하나를 사고 패턴 이름으로 보여준다.
 *   TODO(API 확인 필요: 대표 패턴 1개를 서버가 정하는지, 첫 번째를 쓰는지)
 *   TODO(피그마 확인 필요): 패턴이 없을 때의 표시 디자인이 없다(최소 문구).
 * - 감정 변화: 재판 전 = 접수 감정(`emotion`), 재판 후 = 감정 변화 화면에서 고른 값(`emotion_after`).
 *
 * @param {object | null | undefined} intake 사건 접수 정보 (`case_number`, `thought`, `emotion`)
 * @param {object | null | undefined} result 법정 진행 결과 (`pattern_tags`, `decision`, `emotion_after`)
 * @returns {{
 *   caseNumber: string | null,
 *   thought: string,
 *   finalStatement: string,
 *   caseType: string,
 *   emotion: { label: string, before: number, after: number, sentence: string } | null,
 * }}
 */
export const toSummaryView = (intake, result) => {
  const before = intake?.emotion
  const after = result?.emotion_after
  const canCompare = Boolean(
    before?.type &&
    after?.type &&
    before.type === after.type &&
    typeof before.intensity === 'number' &&
    typeof after.intensity === 'number',
  )
  const label = canCompare ? getEmotionLabel(before.type) : null
  const decision = result?.decision
  const firstPattern = result?.pattern_tags?.[0]

  return {
    caseNumber: intake?.case_number ?? null,
    thought: intake?.thought ?? '',
    finalStatement:
      decision?.final_statement || (decision?.type === 'deferred' ? DEFERRED_STATEMENT : ''),
    caseType: firstPattern ? getThoughtPatternLabel(firstPattern) : NO_PATTERN,
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
