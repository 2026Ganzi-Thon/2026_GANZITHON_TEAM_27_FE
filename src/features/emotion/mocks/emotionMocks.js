/**
 * 감정 변화 화면 목업 데이터. Figma `2-6 감정변화`(1:367) 화면의 내용을 그대로 담는다.
 * 모양은 docs/api-spec.md의 `GET /cases/{id}`를 따른다.
 *
 * 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 */
export const USE_EMOTION_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/**
 * `GET /cases/{id}` 목업 중 감정 변화 화면에 필요한 부분.
 * Figma "접수 당시: 70"에 맞춰 접수 당시 강도를 70으로 둔다. 감정 type은 Figma에 보이지 않아 불안으로 가정한다.
 * TODO(API 확인 필요): 사건 상세 응답에서 접수 당시 감정 필드 이름과 모양(`emotion: { type, intensity }` 추정)을 확인한다.
 */
export const mockCase = {
  id: 'demo',
  case_number: '2026-031',
  status: 'decision_review',
  emotion: { type: 'anxiety', intensity: 70 },
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
