import { apiClient } from '@/lib/apiClient'
import { mockCase, resolveMock, USE_EMOTION_MOCK } from '../mocks/emotionMocks'

/**
 * @typedef {object} CaseEmotion
 * @property {string} type 감정 type (예: 'anxiety')
 * @property {number} intensity 감정 강도 0~100
 */

/**
 * 사건 정보를 조회한다. 감정 변화 화면에서는 접수 당시 감정 강도 표시에만 쓴다.
 * TODO(API 확인 필요): 응답 구조가 미확정이다. 접수 당시 감정이 `emotion`(`{ type, intensity }`)인지 확인한다.
 * TODO(공통화 검토): 기소·변론 화면에도 같은 조회 함수가 있다. 사건(case) 도메인에서 공개하면 그쪽을 쓴다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<{id: string, status: string, emotion?: CaseEmotion | null}>} 사건 정보
 */
export const fetchCaseEmotion = async (caseId) => {
  if (USE_EMOTION_MOCK) return resolveMock({ ...mockCase, id: caseId })
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}
