import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { finalizeDecision, rephraseDecision, requestDecision } from '../api/decision'

/** 판결 도메인 Query key factory */
export const decisionKeys = {
  all: ['decision'],
  draft: (caseId) => [...decisionKeys.all, 'draft', caseId],
}

/**
 * 판결 초안 조회 훅. AI 생성 API라 자동 재시도·포커스 재요청은 끄고 사용자가 직접 다시 시도한다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useDecisionDraft = (caseId) =>
  useQuery({
    queryKey: decisionKeys.draft(caseId),
    queryFn: () => requestDecision(caseId),
    enabled: Boolean(caseId),
    retry: false,
    refetchOnWindowFocus: false,
  })

/**
 * 제안 문장 재표현 mutation 훅. 성공하면 캐시의 제안 문장과 version을 새 값으로 바꾼다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useRephraseDecision = (caseId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => rephraseDecision(caseId, body),
    onSuccess: (result) =>
      queryClient.setQueryData(decisionKeys.draft(caseId), (prev) =>
        prev
          ? {
              ...prev,
              decision: {
                ...prev.decision,
                suggested_statement: result.suggested_statement,
                version: result.version,
              },
            }
          : prev,
      ),
  })
}

/**
 * 판결 확정 mutation 훅.
 * TODO(API 확인 필요): 확정 후 사건 목록·통계 캐시 invalidate는 사건(case)·보관함 도메인 key가 생기면 추가한다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useFinalizeDecision = (caseId) =>
  useMutation({
    mutationFn: (body) => finalizeDecision(caseId, body),
    // 위기 안내(support_required)로 바뀌면 보낸 최종 진술문이 요청 기록에 남지 않도록, 화면이 reset하면 바로 지운다.
    gcTime: 0,
  })
