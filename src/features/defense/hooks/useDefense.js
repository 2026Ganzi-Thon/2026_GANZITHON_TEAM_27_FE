import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCase, fetchDefenseThread, submitDefenseAnswer } from '../api/defense'

/** 변론 도메인 Query key factory */
export const defenseKeys = {
  all: ['defense'],
  thread: (caseId) => [...defenseKeys.all, 'thread', caseId],
  // TODO(공통화 검토): 사건 상세 key는 사건(case) 도메인이 생기면 그쪽 caseKeys.detail(id)로 옮긴다.
  case: (caseId) => [...defenseKeys.all, 'case', caseId],
}

/**
 * 사건 정보 조회 훅. 변론 화면의 사건번호 줄에 쓴다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useDefenseCase = (caseId) =>
  useQuery({
    queryKey: defenseKeys.case(caseId),
    queryFn: () => fetchCase(caseId),
    enabled: Boolean(caseId),
  })

/**
 * 변론 대화 조회 훅. 질문 생성 API가 AI를 부를 수 있어 자동 재시도·포커스 재요청은 끈다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useDefenseThread = (caseId) =>
  useQuery({
    queryKey: defenseKeys.thread(caseId),
    queryFn: () => fetchDefenseThread(caseId),
    enabled: Boolean(caseId),
    retry: false,
    refetchOnWindowFocus: false,
  })

/**
 * 답변 전송 mutation 훅. 성공하면 대화를 다시 불러온다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useSubmitDefenseAnswer = (caseId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, body }) => submitDefenseAnswer(caseId, questionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: defenseKeys.thread(caseId) }),
  })
}
