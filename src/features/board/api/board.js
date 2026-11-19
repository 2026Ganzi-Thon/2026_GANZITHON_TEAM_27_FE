import { mapBoardComment, mapBoardPost } from '@/api/mapBoardPost'
import { apiClient } from '@/lib/apiClient'
import { resolveMock, USE_BOARD_MOCK } from '../mocks/boardMocks'

/**
 * 게시글 상세 정보를 조회한다. `GET /board/posts/{pid}`
 * 공개 게시 글(`visibility === 'public' && status === 'published'`)이면 댓글 목록도 함께 불러와 붙인다.
 * 남의 비공개·검토중·숨김 글은 `404`다(비공개 글은 `unlockPost`로 비밀번호를 보내 연다).
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<import('@/api/mapBoardPost').BoardPostViewModel>} 게시글 상세 정보
 */
export const fetchPostDetail = async (postId) => {
  const encodedId = encodeURIComponent(postId)
  const { data } = await apiClient.get(`/board/posts/${encodedId}`)
  const mapped = mapBoardPost(data)
  if (mapped.visibility === 'public' && mapped.status === 'published') {
    const commentsRes = await apiClient.get(`/board/posts/${encodedId}/comments`)
    const items = Array.isArray(commentsRes?.data?.items) ? commentsRes.data.items : []
    return {
      ...mapped,
      comments: items.filter((item) => item && typeof item === 'object').map(mapBoardComment),
    }
  }
  return mapped
}

/**
 * 비밀번호로 비공개 글을 연다. `POST /board/posts/{pid}/unlock` `{ password }` → 상세 / 틀리면 `404`
 * 비밀번호는 요청 본문에만 담는다(주소·캐시·전역 상태에 두지 않는다). 서버가 분당 5회로 제한한다(`429`).
 *
 * @param {string} postId 게시글 ID
 * @param {string} password 비밀번호
 * @returns {Promise<import('@/api/mapBoardPost').BoardPostViewModel>} 게시글 상세 정보
 */
export const unlockPost = async (postId, password) => {
  const { data } = await apiClient.post(`/board/posts/${encodeURIComponent(postId)}/unlock`, {
    password,
  })
  return mapBoardPost(data)
}

/**
 * 게시글 공감(좋아요) 설정·해제 요청.
 * - 공감 추가: `PUT /board/posts/{pid}/like` → `{ liked: true, like_count }`
 * - 공감 해제: `DELETE /board/posts/{pid}/like` → `{ liked: false, like_count }`
 *
 * @param {string} postId 게시글 ID
 * @param {boolean} [currentlyLiked=false] 현재 공감 여부
 * @returns {Promise<{ liked: boolean, is_liked: boolean, like_count: number }>}
 */
export const togglePostLike = async (postId, currentlyLiked = false) => {
  if (USE_BOARD_MOCK) {
    return resolveMock({ liked: !currentlyLiked, is_liked: !currentlyLiked, like_count: 0 })
  }
  const path = `/board/posts/${encodeURIComponent(postId)}/like`
  const { data } = currentlyLiked ? await apiClient.delete(path) : await apiClient.put(path)
  return {
    ...data,
    is_liked: typeof data?.liked === 'boolean' ? data.liked : data?.is_liked,
  }
}

/**
 * 게시글 북마크 설정·해제 요청.
 * - 북마크 추가: `PUT /board/posts/{pid}/bookmark` → `{ bookmarked: true }`
 * - 북마크 해제: `DELETE /board/posts/{pid}/bookmark` → `{ bookmarked: false }`
 *
 * @param {string} postId 게시글 ID
 * @param {boolean} [currentlyBookmarked=false] 현재 북마크 여부
 * @returns {Promise<{ bookmarked: boolean, is_bookmarked: boolean }>}
 */
export const togglePostBookmark = async (postId, currentlyBookmarked = false) => {
  if (USE_BOARD_MOCK) {
    return resolveMock({ bookmarked: !currentlyBookmarked, is_bookmarked: !currentlyBookmarked })
  }
  const path = `/board/posts/${encodeURIComponent(postId)}/bookmark`
  const { data } = currentlyBookmarked ? await apiClient.delete(path) : await apiClient.put(path)
  return {
    ...data,
    is_bookmarked: typeof data?.bookmarked === 'boolean' ? data.bookmarked : data?.is_bookmarked,
  }
}

/**
 * 댓글 등록 요청. `POST /board/posts/{pid}/comments` `{ body }` → `201` 댓글
 *
 * @param {string} postId 게시글 ID
 * @param {{ content: string }} body 댓글 내용
 */
export const submitComment = async (postId, body) => {
  if (USE_BOARD_MOCK) {
    return resolveMock({
      id: `comment-${Date.now()}`,
      author: '익명',
      content: body.content,
      created_at_label: '방금 전',
      like_count: 0,
      is_liked: false,
    })
  }
  const { data } = await apiClient.post(`/board/posts/${encodeURIComponent(postId)}/comments`, {
    body: body.content,
  })
  if (data?.outcome === 'support_required') return data
  return data && typeof data === 'object' ? mapBoardComment(data) : data
}

/**
 * 사건 없이 게시판에 바로 글을 쓴다. `POST /board/posts` `{ visibility, title, body, password? }`
 * → `201 { id, status }`. 위기 신호가 감지되면 HTTP 200 `{ outcome: "support_required" }`.
 * 공개 글에서는 `password`를 생략한다(`extra="forbid"`). 비밀번호는 요청 본문에만 담는다.
 *
 * @param {{ visibility: string, title: string, body: string, password?: string }} values 글 내용
 * @returns {Promise<object>} 서버 응답
 */
export const createBoardPost = async ({ visibility, title, body, password }) => {
  if (USE_BOARD_MOCK) return resolveMock({ id: `post-${Date.now()}`, status: 'pending_review' })
  const payload = { visibility, title, body }
  if (visibility !== 'public' && password) payload.password = password
  const { data } = await apiClient.post('/board/posts', payload)
  return data
}

/**
 * 내가 작성한 게시글을 수정한다. `PUT /board/posts/{pid}` `{ title, body }`
 * → `200 { id, status: "pending_review" }`. 위기 신호가 감지되면 HTTP 200 `{ outcome: "support_required" }`.
 *
 * @param {string} postId 게시글 ID
 * @param {{ title: string, body: string }} values 수정할 제목과 본문
 * @returns {Promise<object>} 서버 응답
 */
export const updateBoardPost = async (postId, { title, body }) => {
  if (USE_BOARD_MOCK) return resolveMock({ id: postId, status: 'pending_review' })
  const { data } = await apiClient.put(`/board/posts/${encodeURIComponent(postId)}`, {
    title: title.trim(),
    body: body.trim(),
  })
  return data
}

/**
 * 내가 작성한 게시글을 삭제한다. `DELETE /board/posts/{pid}` → `204`
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<void>}
 */
export const deleteBoardPost = async (postId) => {
  if (USE_BOARD_MOCK) return resolveMock(undefined)
  await apiClient.delete(`/board/posts/${encodeURIComponent(postId)}`)
}

/**
 * 내가 작성한 댓글을 수정한다. `PUT /board/comments/{cid}` `{ body }` → `200` 댓글
 * 위기 신호가 감지되면 HTTP 200 `{ outcome: "support_required" }`.
 *
 * @param {string} commentId 댓글 ID
 * @param {{ content: string }} values 수정할 댓글 내용
 * @returns {Promise<object>} 수정된 댓글 또는 위기 안내 응답
 */
export const updateComment = async (commentId, { content }) => {
  if (USE_BOARD_MOCK) {
    return resolveMock({ id: commentId, author: '익명', content: content.trim() })
  }
  const { data } = await apiClient.put(`/board/comments/${encodeURIComponent(commentId)}`, {
    body: content.trim(),
  })
  if (data?.outcome === 'support_required') return data
  return data && typeof data === 'object' ? mapBoardComment(data) : data
}

/**
 * 내가 작성한 댓글을 삭제한다. `DELETE /board/comments/{cid}` → `204`
 *
 * @param {string} commentId 댓글 ID
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
  if (USE_BOARD_MOCK) return resolveMock(undefined)
  await apiClient.delete(`/board/comments/${encodeURIComponent(commentId)}`)
}

/**
 * 댓글 공감(좋아요) 설정·해제 요청.
 * - 공감 추가: `PUT /board/comments/{cid}/like` → `{ liked: true, like_count }`
 * - 공감 해제: `DELETE /board/comments/{cid}/like` → `{ liked: false, like_count }`
 *
 * @param {string} commentId 댓글 ID
 * @param {boolean} [currentlyLiked=false] 현재 공감 여부
 * @returns {Promise<{ liked: boolean, is_liked: boolean, like_count: number }>}
 */
export const toggleCommentLike = async (commentId, currentlyLiked = false) => {
  if (USE_BOARD_MOCK) {
    return resolveMock({ liked: !currentlyLiked, is_liked: !currentlyLiked, like_count: 0 })
  }
  const path = `/board/comments/${encodeURIComponent(commentId)}/like`
  const { data } = currentlyLiked ? await apiClient.delete(path) : await apiClient.put(path)
  return {
    ...data,
    is_liked: typeof data?.liked === 'boolean' ? data.liked : data?.is_liked,
  }
}
