import { useQuery } from '@tanstack/react-query'
import { useCase } from '@/features/case'
import { fetchCaseResult } from '../api/summary'
import { SAMPLE_CASE_ID, SAMPLE_INTAKE, SAMPLE_RESULT } from '../mocks/summaryMocks'

/** 사건요약 도메인 Query key factory */
export const summaryKeys = {
  all: ['summary'],
  result: (caseId) => [...summaryKeys.all, 'result', caseId],
}

/**
 * 사건요약 화면에 필요한 사건 정보를 모은다.
 * - 접수 정보(사건번호·접수 글·접수 감정): 동료의 공용 사건 조회 `useCase(caseId)`
 * - 법정 진행 결과(사고 패턴·판결·종결 감정): `fetchCaseResult`
 * 예시 사건(`sample`)은 조회하지 않고 Figma 예시 값을 돌려준다.
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
  const intakeQuery = useCase(isSample ? undefined : caseId)
  const resultQuery = useQuery({
    queryKey: summaryKeys.result(caseId),
    queryFn: () => fetchCaseResult(caseId),
    enabled: Boolean(caseId) && !isSample,
  })

  if (isSample) {
    return {
      data: { intake: SAMPLE_INTAKE, result: SAMPLE_RESULT },
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch: () => {},
    }
  }

  const failed = [intakeQuery, resultQuery].find((query) => query.isError)
  const isPending = intakeQuery.isPending || resultQuery.isPending
  return {
    data: isPending || failed ? undefined : { intake: intakeQuery.data, result: resultQuery.data },
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
