import { VISIBILITY } from '@/constants/visibility'
import { readPosts, wait } from './mockPostStore'

/** 게시판 글 목록 조회 범위. `mine`은 내 글만, `all`은 모든 글이다. */
export const POST_SCOPE = { mine: 'mine', all: 'all' }

/**
 * 글을 올린 뒤 운영 검토를 통과하기까지 걸리는 시간(목업). 서버에서는 운영자가 승인하므로 글이 바로 보이지 않는다.
 * 목업에서는 0으로 두어 등록한 글이 곧바로 게시판에 나타나게 한다. 검토 중 모습을 확인하려면 값을 올린다.
 */
export const MOCK_REVIEW_DELAY_MS = 0

/**
 * 저장된 글을 목록 응답의 item 모양으로 바꾼다.
 * 올린 지 `MOCK_REVIEW_DELAY_MS`가 지나면 승인된 것으로 보고 `published`와 `published_at`을 채운다.
 */
const toListItem = (post, now) => {
  const createdAt = Date.parse(post.created_at)
  const isReviewed = now - createdAt >= MOCK_REVIEW_DELAY_MS
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    tags: post.tags ?? [],
    visibility: post.visibility,
    status: isReviewed ? 'published' : 'pending_review',
    created_at: post.created_at,
    published_at: isReviewed ? new Date(createdAt + MOCK_REVIEW_DELAY_MS).toISOString() : null,
    // TODO(API 확인 필요): 아래 필드는 명세에 없다. 백엔드가 정하면 이름을 맞춘다.
    pattern_tags: post.pattern_tags ?? [],
    is_mine: true,
    is_hot: false,
    like_count: 0,
    comment_count: 0,
  }
}

/**
 * 게시판 글 목록 조회. `GET /board/posts`, `GET /board/posts/mine`과 같은 모양(`{ items, next_cursor }`)으로 응답한다.
 *
 * - 모든 글(`GET /board/posts`): 검토를 통과한 공개(`public`) 글만, `published_at` 최신순이다. 비밀번호 글은 목록에서 빠진다.
 * - 내 글(`GET /board/posts/mine`): 검토 중인 글까지 내가 올린 글 전체, `created_at` 최신순이다.
 * - 사건 유형(`pattern_tags`)은 하나라도 겹치는 글만 남긴다.
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

  const now = Date.now()
  // 게시판 공유 화면에서 올린 글은 모두 내 글이다.
  const mine = readPosts().map((post) => toListItem(post, now))
  const isMineScope = scope === POST_SCOPE.mine

  let items = isMineScope
    ? mine
    : mine.filter((post) => post.visibility === VISIBILITY.public && post.status === 'published')
  if (patterns.length > 0) {
    items = items.filter((post) => post.pattern_tags.some((pattern) => patterns.includes(pattern)))
  }
  const sortKey = isMineScope ? 'created_at' : 'published_at'
  items.sort((a, b) => b[sortKey].localeCompare(a[sortKey]))
  return { items, next_cursor: null }
}
