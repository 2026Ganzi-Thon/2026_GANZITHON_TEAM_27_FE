/**
 * 판결 화면 목업 데이터. Figma `2-4 판결, 2-5 최종 진술문`(1:26) 화면의 내용을 그대로 담는다.
 * 모양은 docs/api-spec.md의 판결 초안 응답(`POST /cases/{id}/decision`)을 따른다.
 *
 * 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 * TODO(공통화 검토): 기소·변론 목업과 조건이 같다. 목업 유틸을 공통으로 뺄지 검토한다.
 */
export const USE_DECISION_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/**
 * `POST /cases/{id}/decision` 200 응답 목업.
 * 판결 유형은 Figma의 "TRUE, BUT..." 화면에 맞춰 `reframed`(생각 재구성)로 가정한다.
 * 문구는 Figma 그대로다(따옴표 모양과 띄어쓰기 포함).
 * TODO(API 확인 필요): 재표현에 보낼 `version`의 초깃값을 어느 응답에서 받는지 명세에 없다. 지금은 decision.version으로 가정한다.
 */
export const mockDecisionDraft = {
  status: 'decision_review',
  decision: {
    type: 'reframed',
    reported_facts: ['오늘 발표는 아쉬웠지만 긴장한 것은 사실입니다.'],
    unsupported_claims: ['“나는 쓸모없는 사람이다" 라는 생각은 근거가 부족합니다'],
    suggested_statement: '오늘은 실수했지만 나는 여전히 잘하고 있고, 다음엔 더 잘할 수 있다.',
    next_action: null,
    version: 1,
  },
}

/**
 * `POST /cases/{id}/decision/rephrase` 200 응답 목업.
 * Figma에 재표현 결과 문구가 없어 같은 문장을 돌려주고 version만 올린다.
 * TODO(API 확인 필요): 응답 필드 이름(`suggested_statement`, `version`)을 확인한다.
 * @param {number} version 요청에 보낸 version
 */
export const createMockRephrase = (version) => ({
  suggested_statement: mockDecisionDraft.decision.suggested_statement,
  version: version + 1,
})

/** `PUT /cases/{id}/decision/final` 200 응답 목업 (종결된 사건) */
export const mockFinalResult = { status: 'closed' }

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
