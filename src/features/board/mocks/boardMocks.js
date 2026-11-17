/**
 * 게시판 상세 화면 목업 데이터.
 * Figma `4-2 게시판 상세` (node 71:20) 화면의 내용을 그대로 담는다.
 * docs/api-spec.md의 GET /board/posts/{pid} 응답 구조를 따르며, API 준비 시 api/에서 분기를 제거하면 된다.
 *
 * 목업 사용 조건: 개발 서버(import.meta.env.DEV)이면서 VITE_API_BASE_URL이 비어 있을 때.
 * 테스트(MODE === 'test')와 프로덕션 빌드에서는 실제 API를 호출한다.
 */
export const USE_BOARD_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/** 확인용 데모 게시글 ID */
export const DEMO_POST_ID = 'sample'

/**
 * `GET /board/posts/{pid}` 목업 데이터.
 * Figma node 71:20의 실제 문구와 값을 그대로 유지한다.
 */
export const mockPostDetail = {
  id: DEMO_POST_ID,
  title: '오늘따라 제가 너무 별로인 것 같아요.',
  content: '괜히 소심해지고 \n생각이 많아져요.\n요즘 너무 불안한데 다들 괜찮나요?',
  author: '익명',
  created_at_label: '2시간 전',
  like_count: 24,
  is_liked: true,
  is_bookmarked: false,
  comment_count: 8,
  comments: [
    {
      id: 'comment-1',
      author: '익명',
      content: '저도 그래요',
      created_at_label: '1시간 전',
      like_count: 24,
      is_liked: false,
    },
  ],
}

/**
 * 네트워크 지연을 시뮬레이션하여 목업 데이터를 반환한다.
 * @template T
 * @param {T} data
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 200))

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/** 상세 화면에 보여줄 글 시각 문구. 예: `방금 전`, `5분 전`, `2시간 전`, `3일 전` */
const formatDetailTime = (iso, now) => {
  const age = Math.max(0, now - new Date(iso).getTime())
  if (age < MINUTE) return '방금 전'
  if (age < HOUR) return `${Math.floor(age / MINUTE)}분 전`
  if (age < 24 * HOUR) return `${Math.floor(age / HOUR)}시간 전`
  return `${Math.floor(age / (24 * HOUR))}일 전`
}

/** 기록이 없는 글의 공감·댓글 기록 */
const NO_INTERACTIONS = { liked: null, comments: [], commentLikes: {} }

/**
 * 글 원래 값에 내가 한 공감·댓글(목업 저장소)을 합쳐서 상세 응답 모양으로 만든다.
 * - 공감은 누른 적이 없으면(`null`) 글·댓글 원래 상태를 따르고, 누른 적이 있으면 그 상태(공감함/취소함)가 우선한다.
 *   공감 수는 원래 수에서 원래 공감 상태를 빼고 지금 상태를 더해 구한다.
 * - 원래 있던 댓글은 내 댓글이 아니고(`mine: false`), 내가 단 댓글만 `mine: true`라서 고치고 지울 수 있다.
 */
const composeDetail = (base, interactions, now) => {
  const liked = interactions.liked ?? Boolean(base.is_liked)
  const baseComments = (base.comments ?? []).map((comment) => {
    const baseLiked = Boolean(comment.is_liked)
    const likedNow = interactions.commentLikes[comment.id] ?? baseLiked
    return {
      ...comment,
      mine: false,
      is_liked: likedNow,
      like_count: (comment.like_count ?? 0) - Number(baseLiked) + Number(likedNow),
    }
  })
  const myComments = interactions.comments.map((comment) => ({
    id: comment.id,
    author: '익명',
    content: comment.content,
    created_at_label: formatDetailTime(comment.created_at, now),
    like_count: comment.liked ? 1 : 0,
    is_liked: comment.liked,
    mine: true,
  }))
  const comments = [...baseComments, ...myComments]
  return {
    title: base.title,
    content: base.content,
    author: base.author,
    created_at_label: base.created_at_label,
    like_count: (base.like_count ?? 0) - Number(Boolean(base.is_liked)) + Number(liked),
    is_liked: liked,
    is_bookmarked: base.is_bookmarked ?? false,
    is_mine: base.is_mine ?? false,
    visibility: base.visibility,
    comment_count: comments.length,
    comments,
  }
}

/**
 * 게시판 글 저장소(목업)의 내 글을 상세 응답 모양으로 바꾼다. 공감·댓글은 목업 저장소(`lib/mockBoardInteractions`)의 기록을 합친다.
 * TODO(API 확인 필요): 상세 응답 필드(`content`, `author`, `like_count`, `comments` 등)가 확정되면 맞춘다.
 *
 * @param {{ title: string, body: string, visibility?: string, created_at: string }} post 저장된 글
 * @param {ReturnType<import('@/lib/mockBoardInteractions').readMockInteractions>} [interactions] 내가 한 공감·댓글
 * @param {number} [now] 기준 시각(ms)
 */
export const createMockPostDetail = (post, interactions = NO_INTERACTIONS, now = Date.now()) =>
  composeDetail(
    {
      title: post.title,
      content: post.body,
      author: '익명',
      created_at_label: formatDetailTime(post.created_at, now),
      like_count: 0,
      is_liked: false,
      is_mine: true,
      visibility: post.visibility,
    },
    interactions,
    now,
  )

/**
 * 확인용 예시 글(`sample`)의 상세 응답. 예시 글의 공감·댓글 위에 내가 한 공감·댓글을 합친다.
 *
 * @param {ReturnType<import('@/lib/mockBoardInteractions').readMockInteractions>} [interactions] 내가 한 공감·댓글
 * @param {number} [now] 기준 시각(ms)
 */
export const createMockSampleDetail = (interactions = NO_INTERACTIONS, now = Date.now()) =>
  composeDetail({ ...mockPostDetail, is_mine: false, visibility: 'public' }, interactions, now)
