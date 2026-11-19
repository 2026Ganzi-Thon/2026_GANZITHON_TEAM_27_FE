import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { caseKeys } from '@/features/case'
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
 * 판결 확정 mutation 훅. 확정하면 사건이 종결되므로(응답 = 종결된 사건 상세),
 * 사건 목록·상세 캐시(`caseKeys.all`)를 새로 받아 감정 변화·요약·홈 화면이 종결 상태를 보게 한다.
 * 위기 안내(`support_required`)여도 사건 status가 바뀌므로 함께 새로 받는다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useFinalizeDecision = (caseId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => finalizeDecision(caseId, body),
    // 위기 안내(support_required)로 바뀌면 보낸 최종 진술문이 요청 기록에 남지 않도록, 화면이 reset하면 바로 지운다.
    gcTime: 0,
    // 다음 화면 이동을 늦추지 않도록 새로 받기를 기다리지 않는다.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.all })
    },
  })
}
