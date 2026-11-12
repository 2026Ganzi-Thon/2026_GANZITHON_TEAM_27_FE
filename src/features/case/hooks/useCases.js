import { useQuery } from '@tanstack/react-query'
import { listCases } from '../api/listCases'
import { toCaseView } from '../utils'
import { caseKeys } from './caseKeys'

/**
 * 사건 목록 조회 hook. 화면에서 쓰는 모양(`toCaseView`)으로 바꿔서 돌려준다.
 * @returns `data`(사건 view 배열), `isPending`, `isError` 등
 */
export const useCases = () =>
  useQuery({
    queryKey: caseKeys.list(),
    queryFn: listCases,
    select: (response) => response.items.map(toCaseView),
  })
