import { apiClient } from '@/lib/apiClient'

/**
 * 화면 확인용 예시 사건. 주소의 사건 ID가 `sample`이면 서버를 거치지 않고 이 사건을 돌려준다.
 * `/cases/sample/card`, `/cases/sample/share`로 사건 카드와 게시판 공유 화면을 언제든 볼 수 있도록 유지한다.
 */
export const SAMPLE_CASE = {
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
 * 사건 하나 조회. `GET /cases/{id}` (사건 상세). 없는 사건(`404`)이면 `null`을 돌려준다.
 *
 * @param {string} id 사건 ID
 * @returns {Promise<object | null>}
 */
export const getCase = async (id) => {
  if (id === SAMPLE_CASE.id) return SAMPLE_CASE
  try {
    const { data } = await apiClient.get(`/cases/${id}`)
    return data
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}
