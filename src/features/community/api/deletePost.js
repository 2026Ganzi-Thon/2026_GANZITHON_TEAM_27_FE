import { apiClient } from '@/lib/apiClient'

/**
 * 내 게시글 삭제. `DELETE /board/posts/{id}` → `204`
 *
 * @param {string} postId 삭제할 게시글 ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  await apiClient.delete(`/board/posts/${encodeURIComponent(postId)}`)
}
