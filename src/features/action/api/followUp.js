import { apiClient } from '@/lib/apiClient'
import { mockPutFollowUp } from '../mocks/actionMocks'

/** 개발 서버이면서 API 주소가 비었을 때만 목업을 쓴다. 테스트·배포에서는 꺼진다. */
export const USE_ACTION_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/**
 * 작은 행동 선택을 저장한다. `PUT /cases/{id}/follow-up`
 *
 * TODO(API 확인 필요): `409`는 이 API에 대한 설명이 없다(공통: 단계가 맞지 않으면 사건을 다시 조회).
 *
 * @param {string} caseId 사건 ID
 * @param {{ choice: 'action' | 'rest', action_text?: string }} body 요청 본문 (`buildFollowUpBody`로 만든다)
 * @returns {Promise<object>} 응답 본문. 위기 상황이면 `{ outcome: "support_required", support }`
 */
export const putFollowUp = async (caseId, body) => {
  if (USE_ACTION_MOCK) return mockPutFollowUp(caseId, body)
  const { data } = await apiClient.put(`/cases/${caseId}/follow-up`, body)
  return data
}
