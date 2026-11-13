import { useQuery } from '@tanstack/react-query'
import { fetchCaseDetail } from '../api/summary'

/** 사건요약 도메인 Query key factory */
export const summaryKeys = {
  all: ['summary'],
  // TODO(공통화 검토): 사건 상세 key는 사건(case) 도메인의 key(caseKeys)로 옮긴다.
  detail: (caseId) => [...summaryKeys.all, 'detail', caseId],
}

/**
 * 사건요약 화면용 사건 상세 조회 훅.
 * @param {string | undefined} caseId 사건 ID
 */
export const useCaseSummary = (caseId) =>
  useQuery({
    queryKey: summaryKeys.detail(caseId),
    queryFn: () => fetchCaseDetail(caseId),
    enabled: Boolean(caseId),
  })
