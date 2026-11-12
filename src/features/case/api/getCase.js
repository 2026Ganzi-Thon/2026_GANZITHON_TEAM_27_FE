import { readCases, wait } from './mockCaseStore'

/**
 * 화면 확인용 예시 사건. 주소의 사건 ID가 `sample`이면 이 사건을 돌려준다.
 * TODO(API 확인 필요): 서버가 준비되고 사건 종결 흐름이 만들어지면 지운다.
 */
const SAMPLE_CASE = {
  id: 'sample',
  case_number: '2026-000031',
  title: '회의 발표 사건',
  thought: '나는 쓸모없어.',
  final_statement: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
  emotion: { type: 'anxiety', intensity: 70 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  status: 'closed',
  created_at: '2026-11-06T03:00:00.000Z',
}

/**
 * 사건 하나 조회. `GET /cases/{id}`와 같은 역할을 한다. 없으면 `null`을 돌려준다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.get(`/cases/${id}`)`로 바꾼다. 없는 사건은 `404`로 온다.
 * TODO(API 확인 필요): `final_statement` 등 상세 응답 필드가 확정되면 맞춘다.
 *
 * @param {string} id 사건 ID
 * @returns {Promise<object | null>}
 */
export const getCase = async (id) => {
  await wait()
  if (id === SAMPLE_CASE.id) return SAMPLE_CASE
  return readCases().find((item) => item.id === id) ?? null
}
