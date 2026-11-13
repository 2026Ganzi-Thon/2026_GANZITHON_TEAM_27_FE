import { useQuery } from '@tanstack/react-query'
import { fetchCaseEmotion } from '../api/emotion'

/** 감정 변화 도메인 Query key factory */
export const emotionKeys = {
  all: ['emotion'],
  // TODO(공통화 검토): 사건 상세 key는 사건(case) 도메인의 key로 옮긴다.
  case: (caseId) => [...emotionKeys.all, 'case', caseId],
}

/**
 * 접수 당시 감정을 보여주기 위한 사건 조회 훅.
 * @param {string | undefined} caseId 사건 ID
 */
export const useCaseEmotion = (caseId) =>
  useQuery({
    queryKey: emotionKeys.case(caseId),
    queryFn: () => fetchCaseEmotion(caseId),
    enabled: Boolean(caseId),
  })
