import { apiClient } from '@/lib/apiClient'
import { mockPostDetail, resolveMock, USE_BOARD_MOCK } from '../mocks/boardMocks'

/**
 * 게시글 상세 정보를 조회한다.
 * TODO(API 확인 필요): 백엔드 GET /board/posts/{pid} 명세 확정 시 필드명(like_count, comments 등)을 매핑한다.
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<typeof mockPostDetail>} 게시글 상세 정보
 */
export const fetchPostDetail = async (postId) => {
  if (USE_BOARD_MOCK) return resolveMock({ ...mockPostDetail, id: postId })
  const { data } = await apiClient.get(`/board/posts/${postId}`)
  return data
}

/**
 * 게시글 공감(좋아요) 토글 요청.
 * TODO(API 확인 필요): 공감 API 엔드포인트 확정 시 연결한다.
 *
 * @param {string} postId 게시글 ID
 */
export const togglePostLike = async (postId) => {
  if (USE_BOARD_MOCK) return resolveMock({ success: true })
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
    return resolveMock({
      id: `comment-${Date.now()}`,
      author: '익명',
      content: body.content,
      created_at_label: '방금 전',
      like_count: 0,
      is_liked: false,
    })
  }
  const { data } = await apiClient.post(`/board/posts/${postId}/comments`, body)
  return data
}
