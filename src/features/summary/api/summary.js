import { apiClient } from '@/lib/apiClient'
import { readMockCaseDecision } from '@/lib/mockCaseDecisions'
import { resolveMock, USE_SUMMARY_MOCK } from '../mocks/summaryMocks'

/**
 * 사건의 법정 진행 결과(확정한 사고 패턴·판결·종결 감정)를 조회한다.
 * - 목업: 판결 확정·증거 확정 목업이 사건별로 남긴 값(`lib/mockCaseDecisions`). 없으면 null.
 * - 서버: `GET /cases/{caseId}` 응답 그대로(`pattern_tags`, `decision`, `emotion_after`는 변환 함수가 읽는다).
 * TODO(동료 getCase 실제 API 전환 후 useCase로 통일) 기소·변론·사건요약이 같은 사건을 따로 조회한다(D19).
 *   동료의 `getCase`가 실제 API(`GET /cases/{id}`)로 바뀌면 이 함수를 지우고 `@/features/case`의 `useCase`를 쓴다.
 * TODO(API 확인 필요): 서버가 붙으면 접수 정보와 결과를 `GET /cases/{caseId}` 한 번으로 받도록 합친다
 * (지금은 접수 정보를 동료의 useCase로 따로 읽는다).
 * @param {string} caseId 사건 ID
 * @returns {Promise<object | null>}
 */
export const fetchCaseResult = async (caseId) => {
  if (USE_SUMMARY_MOCK) return resolveMock(readMockCaseDecision(caseId))
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}
