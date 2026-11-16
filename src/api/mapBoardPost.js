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
 * @property {object[]} [comments] 댓글 목록
 */

/**
 * 상세 응답의 선택적 data 래퍼를 해제하고 기존 화면 모델로 옮긴다.
 * TODO(API 확인 필요): 응답 필드명 확정 전 임시 매핑.
 * 다른 이름의 필드를 추측하거나 누락된 값을 만들지 않는다.
 * @param {unknown} response Axios response.data에 해당하는 서버 본문
 * @returns {BoardPostViewModel}
 */
export const mapBoardPost = (response) => {
  const post = response?.data === undefined ? response : response.data
  const read = (key, type) => (typeof post?.[key] === type ? post[key] : undefined)
  return {
    title: read('title', 'string'),
    content: read('content', 'string'),
    author: read('author', 'string'),
    created_at_label: read('created_at_label', 'string'),
    like_count: read('like_count', 'number'),
    is_liked: read('is_liked', 'boolean'),
    is_bookmarked: read('is_bookmarked', 'boolean'),
    comment_count: read('comment_count', 'number'),
    comments: Array.isArray(post?.comments)
      ? post.comments.filter((item) => item && typeof item === 'object')
      : undefined,
  }
}
