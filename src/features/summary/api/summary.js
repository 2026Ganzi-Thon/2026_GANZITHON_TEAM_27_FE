import { apiClient } from '@/lib/apiClient'
import { mockCaseDetail, resolveMock, USE_SUMMARY_MOCK } from '../mocks/summaryMocks'

/**
 * 사건 상세를 조회한다. 사건요약 화면의 사건번호·처음 든 생각·최종판결·사건 유형·감정 변화를 그린다.
 * TODO(API 확인 필요): 응답 구조가 미확정이다(docs/api-spec.md §10). 필드가 정해지면 utils.js의 toSummaryView만 고친다.
 * TODO(공통화 검토): 기소·변론·감정 변화 화면에도 같은 조회가 있다. 사건(case) 도메인에서 공개하면 그쪽을 쓴다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<object>} 사건 상세
 */
export const fetchCaseDetail = async (caseId) => {
  if (USE_SUMMARY_MOCK) return resolveMock({ ...mockCaseDetail, id: caseId })
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}
