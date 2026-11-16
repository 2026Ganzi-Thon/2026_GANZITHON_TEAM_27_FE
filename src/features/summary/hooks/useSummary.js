import { useQuery } from '@tanstack/react-query'
import { useCase } from '@/features/case'
import { fetchCaseResult } from '../api/summary'
import { SAMPLE_CASE_ID, SAMPLE_RESULT } from '../mocks/summaryMocks'

/** 사건요약 도메인 Query key factory */
export const summaryKeys = {
  all: ['summary'],
  result: (caseId) => [...summaryKeys.all, 'result', caseId],
}

/**
 * 사건요약 화면에 필요한 사건 정보를 모은다.
 * - 접수 정보(사건번호·접수 글·접수 감정): 동료의 공용 사건 조회 `useCase(caseId)`
 * - 법정 진행 결과(사고 패턴·판결·종결 감정): `fetchCaseResult`
 * 예시 사건(`sample`)도 접수 정보는 동료의 예시 사건(`useCase('sample')`)에서 읽어 감정 변화·사건 카드 화면과
 * 같은 값을 쓴다. 법정 진행 결과만 조회하지 않고 예시 값(`SAMPLE_RESULT`)을 쓴다.
 * 화면 모양으로 바꾸는 일(합치기)은 `toSummaryView`가 한다.
 *
 * @param {string | undefined} caseId 사건 ID
 * @returns {{
 *   data: { intake: object | null, result: object | null } | undefined,
 *   isPending: boolean,
 *   isError: boolean,
 *   isFetching: boolean,
 *   error: unknown,
 *   refetch: () => void,
 * }}
 */
export const useCaseSummary = (caseId) => {
  const isSample = caseId === SAMPLE_CASE_ID
  const intakeQuery = useCase(caseId)
  const resultQuery = useQuery({
    queryKey: summaryKeys.result(caseId),
    queryFn: () => fetchCaseResult(caseId),
    enabled: Boolean(caseId) && !isSample,
  })

  // 예시 사건은 법정 진행 결과를 조회하지 않으므로 접수 정보만 기다린다.
  const queries = isSample ? [intakeQuery] : [intakeQuery, resultQuery]
  const failed = queries.find((query) => query.isError)
  const isPending = queries.some((query) => query.isPending)
  const result = isSample ? SAMPLE_RESULT : resultQuery.data
  return {
    data: isPending || failed ? undefined : { intake: intakeQuery.data, result },
    isPending: isPending && !failed,
    isError: Boolean(failed),
    // "다시 시도" 버튼은 실패한 조회가 다시 불러오는 동안만 막는다(다른 조회가 아직 불러오는 중이어도 누를 수 있다).
    isFetching: Boolean(failed?.isFetching),
    error: failed?.error ?? null,
    refetch: () => {
      if (intakeQuery.isError) intakeQuery.refetch()
      if (resultQuery.isError) resultQuery.refetch()
    },
  }
}
