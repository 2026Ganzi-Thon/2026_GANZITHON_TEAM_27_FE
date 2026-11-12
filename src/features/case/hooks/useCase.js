import { useQuery } from '@tanstack/react-query'
import { getCase } from '../api/getCase'
import { caseKeys } from './caseKeys'

/**
 * 사건 하나를 조회하는 hook. 사건이 없으면 `data`가 `null`이다.
 * @param {string | undefined} id 사건 ID
 * @returns `data`(API 사건 item 또는 `null`), `isPending`, `isError` 등
 */
export const useCase = (id) =>
  useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => getCase(id),
    enabled: Boolean(id),
  })
