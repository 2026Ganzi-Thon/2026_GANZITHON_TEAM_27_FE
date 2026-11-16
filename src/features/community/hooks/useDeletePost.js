import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../api/deletePost'
import { postKeys } from './postKeys'

/**
 * 게시글 삭제 mutation hook. 삭제하면 게시판 목록을 새로 받는다.
 * @returns 삭제 요청의 `mutate`, `isPending`, `error` 등
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  })
}
