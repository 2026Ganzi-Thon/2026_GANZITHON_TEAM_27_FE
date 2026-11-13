import { getThoughtPatternLabel } from '@/constants/thoughtPatterns'

/**
 * 기소 초안을 화면 표시용 값으로 바꾼다.
 * @param {import('./api/prosecution').ProsecutionDraft} draft 기소 초안
 * @returns {{title: string, claim: string, patterns: string[], evidence: Array<{type?: string, text: string}>}}
 */
export const toProsecutionView = (draft) => ({
  title: draft.title ?? '',
  // TODO(API 확인 필요): claim이 완성된 기소 문장인지, "나는 쓸모없어" 같은 원문 생각인지 확인한다.
  // 원문 생각이면 `피고인은 "{claim}" 라는 생각으로\n본 법정에 기소되었습니다.` 형태로 감싼다.
  claim: draft.claim ?? '',
  patterns: (draft.pattern_candidates ?? []).map(getThoughtPatternLabel),
  evidence: draft.evidence ?? [],
})

/**
 * 기소 초안을 `PUT /cases/{id}/evidence` 요청 본문으로 바꾼다.
 * 지금은 증거 수정 화면이 없어 초안을 그대로 확정한다.
 * @param {import('./api/prosecution').ProsecutionDraft} draft 기소 초안
 * @returns {{claim: string, pattern_tags: string[], evidence: Array<{type: string, text: string}>}}
 */
export const toEvidencePayload = (draft) => ({
  claim: draft.claim,
  pattern_tags: draft.pattern_candidates ?? [],
  evidence: (draft.evidence ?? []).map(({ type, text }) => ({ type, text })),
})

/**
 * API 오류를 화면에 보여줄 문구와 재시도 가능 여부로 바꾼다. (docs/api-spec.md §7)
 * @param {unknown} error Axios 오류
 * @returns {{message: string, canRetry: boolean}}
 */
export const getProsecutionErrorState = (error) => {
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error?.message

  if (status === 404) {
    return { message: '사건을 찾을 수 없어요.', canRetry: false }
  }
  if (status === 409) {
    // TODO(API 확인 필요): GET /cases/{id}로 다시 조회해 현재 status 화면으로 이동한다(사건 상세 API 연동 후).
    return {
      message: '사건 진행 단계가 바뀌었어요. 사건 목록에서 다시 열어 주세요.',
      canRetry: false,
    }
  }
  if (status === 422) {
    // 입력 형식·길이·범위 위반(명세 §3.2). 같은 내용으로 다시 보내도 같은 오류라 다시 시도하지 않는다.
    // TODO(문구 확인 필요): 입력 오류 안내 문구가 디자인에 없다.
    return { message: '입력한 내용을 확인해 주세요.', canRetry: false }
  }
  if (status === 429) {
    return { message: '요청이 많아요. 잠시 후 다시 시도해 주세요.', canRetry: true }
  }
  if (status === 502 || status === 503) {
    return { message: 'AI가 잠시 응답하지 못했어요. 다시 시도해 주세요.', canRetry: true }
  }
  return {
    message: serverMessage ?? '연결에 문제가 생겼어요. 다시 시도해 주세요.',
    canRetry: true,
  }
}
