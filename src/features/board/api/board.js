import { mapBoardPost } from '@/api/mapBoardPost'
import { deletePost, getPost } from '@/features/community'
import { apiClient } from '@/lib/apiClient'
import {
  addMockComment,
  deleteMockComment,
  readMockInteractions,
  toggleMockCommentLike,
  toggleMockPostLike,
  updateMockComment,
} from '@/lib/mockBoardInteractions'
import {
  createMockPostDetail,
  createMockSampleDetail,
  DEMO_POST_ID,
  resolveMock,
  USE_BOARD_MOCK,
} from '../mocks/boardMocks'

/**
 * 게시글 상세 정보를 조회한다.
 * 목업 모드(개발 서버 + `VITE_API_BASE_URL` 비어 있음)에서는 `sample`이 예시 글을 돌려주고, 그 밖의 글은 내가 올린 글(목업 저장소)에서 찾는다.
 * 어느 쪽이든 내가 한 공감·댓글(목업 저장소)이 합쳐진다. 없는 글은 `404` 모양의 오류를 던진다.
 * TODO(API 확인 필요): 백엔드 GET /board/posts/{pid} 명세 확정 시 필드명(like_count, comments 등)을 매핑한다.
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<import('@/api/mapBoardPost').BoardPostViewModel>} 게시글 상세 정보
 */
export const fetchPostDetail = async (postId) => {
  if (USE_BOARD_MOCK) {
    const interactions = readMockInteractions(postId)
    if (postId === DEMO_POST_ID)
      return mapBoardPost(await resolveMock(createMockSampleDetail(interactions)))
    const post = await getPost(postId)
    if (!post) throw Object.assign(new Error('Not Found'), { response: { status: 404 } })
    return mapBoardPost(createMockPostDetail(post, interactions))
  }
  const { data } = await apiClient.get(`/board/posts/${encodeURIComponent(postId)}`)
  return mapBoardPost(data)
}

/**
 * 게시글 공감(좋아요) 요청. 공감한 글이면 취소하고, 아니면 공감한다(글 하나에 한 번까지).
 * TODO(API 확인 필요): 공감 API 엔드포인트 확정 시 연결한다.
 *
 * @param {string} postId 게시글 ID
 * @param {boolean} [baseLiked] 글에 원래 공감해 둔 상태(목업에서만 쓴다)
 */
export const togglePostLike = async (postId, baseLiked = false) => {
  if (USE_BOARD_MOCK) {
    toggleMockPostLike(postId, baseLiked)
    return resolveMock({ success: true })
  }
  const { data } = await apiClient.post(`/board/posts/${postId}/like`)
  return data
}

/**
 * 댓글 등록 요청.
 * TODO(API 확인 필요): 댓글 등록 엔드포인트 확정 시 연결한다.
 *
 * @param {string} postId 게시글 ID
 * @param {{ content: string }} body 댓글 내용
 */
export const submitComment = async (postId, body) => {
  if (USE_BOARD_MOCK) {
    const comment = addMockComment(postId, body.content)
    return resolveMock({ id: comment.id, content: comment.content })
  }
  const { data } = await apiClient.post(`/board/posts/${postId}/comments`, body)
  return data
}

/**
 * 내 댓글 수정 요청.
 * TODO(API 확인 필요): 댓글 수정 API가 명세에 없다.
 *
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 * @param {{ content: string }} body 바꿀 내용
 */
export const updateComment = async (postId, commentId, body) => {
  if (USE_BOARD_MOCK) {
    updateMockComment(postId, commentId, body.content)
    return resolveMock({ success: true })
  }
  const { data } = await apiClient.patch(`/board/posts/${postId}/comments/${commentId}`, body)
  return data
}

/**
 * 내 댓글 삭제 요청.
 * TODO(API 확인 필요): 댓글 삭제 API가 명세에 없다.
 *
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 */
export const deleteComment = async (postId, commentId) => {
  if (USE_BOARD_MOCK) {
    deleteMockComment(postId, commentId)
    return resolveMock({ success: true })
  }
  await apiClient.delete(`/board/posts/${postId}/comments/${commentId}`)
  return { success: true }
}

/**
 * 댓글 공감 요청. 공감한 댓글이면 취소하고, 아니면 공감한다(댓글 하나에 한 번까지).
 * TODO(API 확인 필요): 댓글 공감 API가 명세에 없다.
 *
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 * @param {boolean} [baseLiked] 댓글에 원래 공감해 둔 상태(목업에서만 쓴다)
 */
export const toggleCommentLike = async (postId, commentId, baseLiked = false) => {
  if (USE_BOARD_MOCK) {
    toggleMockCommentLike(postId, commentId, baseLiked)
    return resolveMock({ success: true })
  }
  const { data } = await apiClient.post(`/board/posts/${postId}/comments/${commentId}/like`)
  return data
}

/**
 * 내 게시글 삭제 요청. `DELETE /board/posts/{id}`(명세: 204).
 *
 * @param {string} postId 게시글 ID
 */
export const removePost = async (postId) => {
  if (USE_BOARD_MOCK) return deletePost(postId)
  await apiClient.delete(`/board/posts/${encodeURIComponent(postId)}`)
  return undefined
}
