import { readPosts, wait } from './mockPostStore'

/** 게시판 글 목록 조회 범위. `mine`은 내 글만, `all`은 모든 글이다. */
export const POST_SCOPE = { mine: 'mine', all: 'all' }

/**
 * 게시판 글 목록 조회. `GET /board/posts`, `GET /board/posts/mine`과 같은 모양(`{ items, next_cursor }`)으로 응답한다.
 * 최신 글이 먼저 오고, 사건 유형(`patterns`)은 하나라도 겹치는 글만 남긴다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.get('/board/posts', { params })`로 바꾼다.
 * 명세의 검색 파라미터는 `tag` 하나(1~24자)라서, 여러 사건 유형을 한 번에 거를 수 있는지 확인한다.
 * TODO(API 확인 필요): 목록은 20개씩 cursor로 받는다(`useInfiniteQuery`). 응답 구조가 확정되면 붙인다.
 *
 * @param {{ patterns?: string[], scope?: 'mine' | 'all' | null }} [filters] 사건 유형과 공개 범위 필터
 * @returns {Promise<{ items: object[], next_cursor: string | null }>}
 */
export const listPosts = async ({ patterns = [], scope = null } = {}) => {
  await wait()

  // 게시판 공유 화면에서 올린 글은 모두 내 글이다.
  const mine = readPosts().map((post) => ({
    ...post,
    patterns: post.patterns ?? post.tags ?? [],
    mine: true,
    hot: false,
    likes: 0,
    comments: 0,
  }))

  let items = mine
  if (scope === POST_SCOPE.mine) items = items.filter((post) => post.mine)
  if (patterns.length > 0) {
    items = items.filter((post) => post.patterns.some((pattern) => patterns.includes(pattern)))
  }
  items.sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { items, next_cursor: null }
}
