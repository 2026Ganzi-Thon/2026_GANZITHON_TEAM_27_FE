import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCase,
  fetchDefenseThread,
  simplifyDefenseQuestion,
  submitDefenseAnswer,
} from '../api/defense'
import { isSupportRequired } from '../utils'

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
 * 위기 안내(`support_required`) 응답이면 대화를 다시 불러오지 않는다(화면이 위기 안내로 넘어간다).
 * 답변 원문이 요청 기록(mutation 캐시)에 남지 않도록, 화면이 reset하면 바로 지워지게 gcTime을 0으로 둔다.
 * @param {string | undefined} caseId 사건 ID
 */
export const useSubmitDefenseAnswer = (caseId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, body }) => submitDefenseAnswer(caseId, questionId, body),
    gcTime: 0,
    onSuccess: (response) => {
      if (isSupportRequired(response)) return undefined
      return queryClient.invalidateQueries({ queryKey: defenseKeys.thread(caseId) })
    },
  })
}

/**
 * "질문을 쉽게 바꿔주세요." mutation 훅.
 * 기존 질문 말풍선은 그대로 두고 쉬운 문장을 새 말풍선으로 보여주도록, 받은 문장을 그 질문의
 * `simplifiedPrompts`에 쌓고 revision을 새 값으로 바꾼다(다음 답변은 새 revision으로 보낸다).
 * @param {string | undefined} caseId 사건 ID
 */
export const useSimplifyDefenseQuestion = (caseId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, revision }) =>
      simplifyDefenseQuestion(caseId, questionId, { revision }),
    onSuccess: (result, { questionId }) =>
      queryClient.setQueryData(defenseKeys.thread(caseId), (thread = []) =>
        thread.map((item) =>
          item.question?.id === questionId
            ? {
                ...item,
                question: {
                  ...item.question,
                  revision: result.revision,
                  simplifiedPrompts: [...(item.question.simplifiedPrompts ?? []), result.prompt],
                },
              }
            : item,
        ),
      ),
  })
}
