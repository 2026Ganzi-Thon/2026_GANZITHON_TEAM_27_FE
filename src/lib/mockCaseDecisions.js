/**
 * [목업 전용] 법정 진행 결과 임시 저장소. 서버가 준비되기 전까지 브라우저(localStorage)에 사건 ID별로 저장한다.
 *
 * 기소·판결 목업이 확정한 값을 저장하고, 사건요약 화면이 읽는다. 저장 모양은 `GET /cases/{caseId}` 응답의
 * 일부와 같게 둔다(사건요약은 서버 응답과 같은 변환 함수로 읽는다).
 * - `pattern_tags`: 기소 "변론 시작"에서 확정한 사고 패턴 (`PUT /cases/{id}/evidence`)
 * - `decision: { type, final_statement }`, `emotion_after`, `status`: 감정 변화 "다음"에서 확정한 판결 (`PUT /cases/{id}/decision/final`)
 *
 * 사건 접수 정보(동료의 `mock-case-files`)는 건드리지 않는다. 목업 모드(개발 서버 + `VITE_API_BASE_URL` 비어 있음)에서만 쓴다.
 * TODO(API 확인 필요): 서버가 준비되면 이 파일을 지운다(`GET /cases/{caseId}` 응답에 같은 값이 들어온다).
 */
const STORAGE_KEY = 'mock-case-decisions'

/** 저장된 전체 기록을 읽는다. 읽을 수 없으면 빈 객체다. */
const readAll = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

/**
 * 사건 하나의 법정 진행 기록을 읽는다.
 * @param {string} caseId 사건 ID
 * @returns {object | null} 저장된 기록. 없으면 null
 */
export const readMockCaseDecision = (caseId) => readAll()[caseId] ?? null

/**
 * 사건 하나의 법정 진행 기록에 값을 덧붙여 저장한다(같은 필드는 새 값으로 바꾼다).
 * 저장할 수 없어도(저장 공간 부족 등) 화면은 계속 동작한다.
 * @param {string} caseId 사건 ID
 * @param {object} patch 덧붙일 값 (예: `{ pattern_tags: ['labeling'] }`)
 * @returns {object} 저장한 뒤의 기록
 */
export const saveMockCaseDecision = (caseId, patch) => {
  const all = readAll()
  const next = { ...(all[caseId] ?? {}), ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [caseId]: next }))
  } catch {
    // 저장 공간을 쓸 수 없으면 이번 기록만 남지 않는다.
  }
  return next
}
