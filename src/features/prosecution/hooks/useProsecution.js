import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchCase, requestProsecution, submitEvidence } from '../api/prosecution'

/** 기소 도메인 Query key factory */
export const prosecutionKeys = {
  all: ['prosecution'],
  draft: (caseId) => [...prosecutionKeys.all, 'draft', caseId],
  // TODO(공통화 검토): 사건 상세 key는 사건(case) 도메인이 생기면 그쪽 caseKeys.detail(id)로 옮긴다.
  case: (caseId) => [...prosecutionKeys.all, 'case', caseId],
}

/**
 * 사건 정보 조회 훅. 기소 화면의 사건번호 뱃지에 쓴다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useCaseSummary = (caseId) =>
  useQuery({
    queryKey: prosecutionKeys.case(caseId),
    queryFn: () => fetchCase(caseId),
    enabled: Boolean(caseId),
  })

/**
 * 기소 초안 조회 훅.
 * POST 요청이지만 같은 사건이면 서버가 같은 초안을 돌려주므로 조회(useQuery)처럼 다룬다.
 * AI 생성이라 오래 걸릴 수 있어 자동 재시도·포커스 재요청은 끄고, 오류 시 사용자가 다시 시도한다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useProsecutionDraft = (caseId) =>
  useQuery({
    queryKey: prosecutionKeys.draft(caseId),
    queryFn: () => requestProsecution(caseId),
    enabled: Boolean(caseId),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

/**
 * 증거 확정 mutation 훅. "변론 시작"에서 기소 초안을 확정한다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useSubmitEvidence = (caseId) =>
  useMutation({
    mutationFn: (body) => submitEvidence(caseId, body),
  })
