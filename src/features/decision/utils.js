/** 최종 진술문 최대 길이 (docs/api-spec.md §5, 앞뒤 공백 제거 후 기준) */
export const MAX_STATEMENT_LENGTH = 1000

/**
 * 최종 진술문을 검사한다. 판단 보류(`deferred`)는 비워 둘 수 있다.
 * @param {string} statement 진술문
 * @param {import('./api/decision').DecisionType} decisionType 판결 유형
 * @returns {string | null} 오류 문구. 문제가 없으면 null
 */
export const validateStatement = (statement, decisionType) => {
  const length = statement.trim().length
  if (length === 0) return decisionType === 'deferred' ? null : '수정된 생각을 입력해 주세요.'
  if (length > MAX_STATEMENT_LENGTH) return `${MAX_STATEMENT_LENGTH}자 이내로 입력해 주세요.`
  return null
}

/**
 * 판결 확정 요청 본문을 만든다. 판단 보류에서 진술문이 비어 있으면 `final_statement`를 뺀다.
 * @param {import('./api/decision').DecisionType} decisionType 판결 유형
 * @param {string} statement 최종 진술문
 * @returns {{decision_type: string, final_statement?: string}}
 */
export const toFinalPayload = (decisionType, statement) => {
  const finalStatement = statement.trim()
  if (decisionType === 'deferred' && !finalStatement) return { decision_type: decisionType }
  return { decision_type: decisionType, final_statement: finalStatement }
}

/**
 * 판결 확정 요청 본문을 만든다. 판결 화면에서 고른 내용에 종결 시점 감정(emotion_after)을 붙인다.
 * 명세 §4: 감정은 type과 intensity를 둘 다 보내거나 둘 다 생략한다(접수 때 감정이 없으면 생략).
 * @param {{decision_type: string, final_statement?: string}} decision 판결 화면에서 넘겨받은 내용
 * @param {{type: string | null, intensity: number} | null} [emotionAfter] 감정 변화 화면에서 고른 지금 감정
 * @returns {{decision_type: string, final_statement?: string, emotion_after?: {type: string, intensity: number}}}
 */
export const toFinalRequest = (decision, emotionAfter) =>
  emotionAfter?.type
    ? { ...decision, emotion_after: { type: emotionAfter.type, intensity: emotionAfter.intensity } }
    : { ...decision }

/**
 * API 오류를 화면에 보여줄 문구와 재시도 가능 여부로 바꾼다. (docs/api-spec.md §7)
 * @param {unknown} error Axios 오류
 * @returns {{message: string, canRetry: boolean}}
 */
export const getDecisionErrorState = (error) => {
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error?.message

  if (status === 404) return { message: '사건을 찾을 수 없어요.', canRetry: false }
  if (status === 409) {
    // TODO(API 확인 필요): GET /cases/{id}로 다시 조회해 현재 status 화면으로 이동한다.
    return { message: '판결 내용이 바뀌었어요. 다시 불러와 주세요.', canRetry: true }
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

/**
 * 서버 응답이 위기 지원 안내로 바뀌었는지. 최종 진술문은 자유 입력이라 HTTP 200이어도 먼저 확인한다(명세 §6.2).
 * @param {unknown} response 서버 응답
 * @returns {boolean}
 */
export const isSupportRequired = (response) => response?.outcome === 'support_required'
