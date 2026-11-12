import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCase } from '../api/deleteCase'
import { caseKeys } from './caseKeys'

/**
 * 사건 삭제 mutation hook. 삭제하면 사건 목록을 새로 받는다.
 * @returns 삭제 요청의 `mutate`, `isPending`, `error` 등
 */
export const useDeleteCase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  })
}
