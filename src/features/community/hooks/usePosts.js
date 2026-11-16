import { useQuery } from '@tanstack/react-query'
import { listPosts } from '../api/listPosts'
import { toPostView } from '../utils'
import { postKeys } from './postKeys'

/**
 * 게시판 글 목록 조회 hook. 화면에서 쓰는 모양(`toPostView`)으로 바꿔서 돌려준다.
 *
 * @param {{ patterns?: string[], scope?: 'mine' | 'all' | null }} [filters] 사건 유형과 공개 범위 필터
 * @returns `data`(글 view 배열), `isPending`, `isError` 등
 */
export const usePosts = (filters = {}) =>
  useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => listPosts(filters),
    select: (response) => response.items.map(toPostView),
  })
