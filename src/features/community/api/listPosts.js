import { apiClient } from '@/lib/apiClient'

/** 게시판 글 목록 조회 범위. `mine`은 내 글만, `all`은 모든 글이다. */
export const POST_SCOPE = { mine: 'mine', all: 'all' }

/** 게시글의 `tags` 또는 `pattern_tags`에 선택된 패턴 중 하나라도 포함되는지 확인한다. */
const matchesPatterns = (post, patterns) =>
  patterns.length === 0 ||
  [...(post.pattern_tags ?? []), ...(post.tags ?? [])].some((tag) => patterns.includes(tag))

/**
 * 게시판 글 목록 조회 (`{ items, next_cursor }`, 최신 글이 먼저 온다).
 * - `scope === 'mine'`: `GET /board/posts/mine` (검토 중인 글을 포함한 내 글 전체)
 * - 그 밖: `GET /board/posts` (게시된 공개 글). v1.4 서버는 단일 `tag` 문자열만 받으므로
 *   사건 유형이 1개일 때만 `params: { tag: patterns[0] }`로 보내고, 2개 이상이면 받은 뒤 화면에서 거른다.
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
    const items = (data?.items ?? []).filter((post) => matchesPatterns(post, patterns))
    return { items, next_cursor: data?.next_cursor ?? null }
  }
  const { data } = await apiClient.get('/board/posts', {
    params: patterns.length === 1 ? { tag: patterns[0] } : undefined,
  })
  const rawItems = data?.items ?? []
  const items =
    patterns.length > 1 ? rawItems.filter((post) => matchesPatterns(post, patterns)) : rawItems
  return { items, next_cursor: data?.next_cursor ?? null }
}
