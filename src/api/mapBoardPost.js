import { formatPostTime } from '@/lib/formatPostTime'

/**
 * @typedef {object} BoardPostViewModel
 * @property {string} [title] 제목
 * @property {string} [content] 본문
 * @property {string} [author] 작성자
 * @property {string} [created_at_label] 작성 시각 표시
 * @property {number} [like_count] 공감 수
 * @property {boolean} [is_liked] 공감 여부
 * @property {boolean} [is_bookmarked] 북마크 여부
 * @property {number} [comment_count] 댓글 수
 * @property {string} [visibility] 공개 범위 (`public` | `password_protected`)
 * @property {string} [status] 게시글 상태 (`published` | `pending_review` | ...)
 * @property {boolean} [is_mine] 내가 쓴 글 여부
 * @property {string[]} [tags] 태그 목록
 * @property {object[]} [comments] 댓글 목록 (`{ id, author, content, created_at, created_at_label, is_mine, like_count, is_liked }`)
 */

/**
 * 표시용 시각 문구를 고른다. 서버가 `created_at_label`을 주면 그대로 쓰고, 없으면 시각(ISO)으로 만든다.
 * @param {object} item 게시글 또는 댓글
 * @param {...string} isoKeys 시각을 찾을 필드 이름(앞에서부터)
 * @returns {string | undefined}
 */
const toTimeLabel = (item, ...isoKeys) => {
  if (typeof item?.created_at_label === 'string') return item.created_at_label
  const iso = isoKeys.map((key) => item?.[key]).find((value) => typeof value === 'string')
  return iso ? formatPostTime(iso) || undefined : undefined
}

/**
 * 댓글 응답 항목을 화면 모델로 옮긴다. v1.4 필드(`body`, `author_label`, `liked_by_me`)와
 * 기존 필드(`content`, `author`, `is_liked`)를 모두 지원한다.
 * @param {object} item 댓글 객체
 * @returns {object}
 */
export const mapBoardComment = (item) => ({
  ...item,
  content: typeof item.body === 'string' ? item.body : item.content,
  author: typeof item.author_label === 'string' ? item.author_label : item.author,
  is_liked: typeof item.liked_by_me === 'boolean' ? item.liked_by_me : item.is_liked,
  created_at_label: toTimeLabel(item, 'created_at'),
})

/**
 * 게시글 상세 응답(`GET /board/posts/{pid}`, `POST /board/posts/{pid}/unlock`)을 화면 모델로 옮긴다.
 * 선택적 data 래퍼를 해제하고, 작성 시각 문구(`created_at_label`)가 없으면 `published_at ?? created_at`으로 만든다.
 * v1.4 필드(`body`, `author_label`, `liked_by_me`, `bookmarked_by_me`)와 기존 필드(`content`, `author`, `is_liked`, `is_bookmarked`)를 모두 지원한다.
 * @param {unknown} response Axios response.data에 해당하는 서버 본문
 * @returns {BoardPostViewModel}
 */
export const mapBoardPost = (response) => {
  const post = response?.data === undefined ? response : response.data
  const read = (key, type) => (typeof post?.[key] === type ? post[key] : undefined)
  return {
    title: read('title', 'string'),
    content: read('body', 'string') ?? read('content', 'string'),
    author: read('author_label', 'string') ?? read('author', 'string'),
    created_at_label: toTimeLabel(post, 'published_at', 'created_at'),
    like_count: read('like_count', 'number'),
    is_liked: read('liked_by_me', 'boolean') ?? read('is_liked', 'boolean'),
    is_bookmarked: read('bookmarked_by_me', 'boolean') ?? read('is_bookmarked', 'boolean'),
    comment_count: read('comment_count', 'number'),
    visibility: read('visibility', 'string'),
    status: read('status', 'string'),
    is_mine: read('is_mine', 'boolean'),
    tags: Array.isArray(post?.tags) ? post.tags : undefined,
    comments: Array.isArray(post?.comments)
      ? post.comments.filter((item) => item && typeof item === 'object').map(mapBoardComment)
      : undefined,
  }
}
