import { apiClient } from '@/lib/apiClient'

/** 게시판 글 목록 조회 범위. `mine`은 내 글만, `all`은 모든 글이다. */
export const POST_SCOPE = { mine: 'mine', all: 'all' }

/**
 * 게시판 글 목록 조회 (`{ items, next_cursor }`, 최신 글이 먼저 온다).
 * - `scope === 'mine'`: `GET /board/posts/mine` (검토 중인 글을 포함한 내 글 전체)
 * - 그 밖: `GET /board/posts` (게시된 공개 글). 사건 유형(`patterns`)은 `tag`를 여러 번 붙여 보내고,
 *   서버는 하나라도 일치하는 글(tags·pattern_tags 모두 검사)을 돌려준다. 예: `?tag=labeling&tag=mind_reading`
 *
 * TODO(API 확인 필요): 목록은 cursor로 이어 받을 수 있다. 더 보기가 생기면 `useInfiniteQuery`로 붙인다.
 *
 * @param {{ patterns?: string[], scope?: 'mine' | 'all' | null }} [filters] 사건 유형과 공개 범위 필터
 * @returns {Promise<{ items: object[], next_cursor: string | null }>}
 */
export const listPosts = async ({ patterns = [], scope = null } = {}) => {
  if (scope === POST_SCOPE.mine) {
    // `GET /board/posts/mine`은 tag 필터가 없어서 사건 유형은 받은 뒤 화면에서 거른다.
    const { data } = await apiClient.get('/board/posts/mine')
    const items = (data?.items ?? []).filter(
      (post) =>
        patterns.length === 0 ||
        [...(post.pattern_tags ?? []), ...(post.tags ?? [])].some((tag) => patterns.includes(tag)),
    )
    return { items, next_cursor: data?.next_cursor ?? null }
  }
  const { data } = await apiClient.get('/board/posts', {
    params: patterns.length > 0 ? { tag: patterns } : undefined,
    paramsSerializer: { indexes: null },
  })
  return { items: data?.items ?? [], next_cursor: data?.next_cursor ?? null }
}
