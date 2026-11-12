import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCase } from '../api/createCase'
import { caseKeys } from './caseKeys'

/**
 * 사건 접수 mutation hook. 사건이 만들어지면 사건 목록을 새로 받아서 홈의 최근 사건파일에 바로 나타나게 한다.
 * 위기 상황(`support_required`)이면 사건이 만들어지지 않으므로 목록을 건드리지 않는다.
 * @returns 접수 요청의 `mutate`, `isPending`, `error`, `data` 등
 */
export const useCreateCase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCase,
    onSuccess: (result) => {
      if (result.outcome === 'created') {
        return queryClient.invalidateQueries({ queryKey: caseKeys.all })
      }
    },
  })
}
