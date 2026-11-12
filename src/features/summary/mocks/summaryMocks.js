/**
 * 사건요약 화면 목업 데이터. Figma `사건요약`(8:687) 화면의 내용을 그대로 담는다.
 * 모양은 docs/api-spec.md의 `GET /cases/{id}`(사건·근거·질문·판결·작은 행동 전체)를 따른다.
 *
 * 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 */
export const USE_SUMMARY_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/**
 * `GET /cases/{id}` 200 응답 목업 중 사건요약 화면에 필요한 부분.
 * TODO(API 확인 필요): 사건 상세 응답 구조가 미확정이다. 아래 필드 이름은 명세의 요청 필드 이름을 따라 추정했다.
 * - `decision.final_statement`: 최종판결 문장 (`PUT /cases/{id}/decision/final`의 `final_statement`)
 * - `case_type`: "사건 유형". 명세에 대응하는 필드가 없어 임시 이름이다.
 */
export const mockCaseDetail = {
  id: 'demo',
  case_number: '2026-031',
  status: 'closed',
  thought: '나는 왜 자꾸 불안할까?',
  case_type: '과도한 자기비판',
  emotion: { type: 'anxiety', intensity: 80 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  decision: { type: 'reframed', final_statement: '그럴 수 있다.' },
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
