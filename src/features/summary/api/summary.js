import { apiClient } from '@/lib/apiClient'
import { readMockCaseDecision } from '@/lib/mockCaseDecisions'
import { resolveMock, USE_SUMMARY_MOCK } from '../mocks/summaryMocks'

/**
 * 사건의 법정 진행 결과(확정한 사고 패턴·판결·종결 감정)를 조회한다.
 * - 목업: 판결 확정·증거 확정 목업이 사건별로 남긴 값(`lib/mockCaseDecisions`). 없으면 null.
 * - 서버: `GET /cases/{caseId}` 응답 그대로(`pattern_tags`, `decision`, `emotion_after`는 변환 함수가 읽는다).
 *   서버 모드의 사건요약 화면은 `useCase` 하나로 읽으므로(`useCaseSummary`) 이 함수는 목업 모드에서만 쓴다.
 * @param {string} caseId 사건 ID
 * @returns {Promise<object | null>}
 */
export const fetchCaseResult = async (caseId) => {
  if (USE_SUMMARY_MOCK) return resolveMock(readMockCaseDecision(caseId))
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}
