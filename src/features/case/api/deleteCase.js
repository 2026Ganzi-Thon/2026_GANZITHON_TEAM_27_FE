import { apiClient } from '@/lib/apiClient'

/**
 * 사건 삭제. `DELETE /cases/{id}` → `204`
 * 서버가 근거·질문·판결·게시글을 함께 지운다.
 *
 * @param {string} id 삭제할 사건 ID
 * @returns {Promise<void>}
 */
export const deleteCase = async (id) => {
  await apiClient.delete(`/cases/${id}`)
}
