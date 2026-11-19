import { apiClient } from '@/lib/apiClient'

/** 화면 확인용 예시 사건 ID. 서버에 없는 사건이라 게시 요청을 보내지 않는다. */
const SAMPLE_CASE_ID = 'sample'

/**
 * 종결된 사건을 게시판에 공유한다. `POST /cases/{id}/posts`
 * → `201 { id, status: 'pending_review', visibility, created_at }`
 * (서버가 `BOARD_AUTO_PUBLISH`면 바로 `published`일 수 있다)
 *
 * - 위기 신호가 감지되면 HTTP 200 `{ outcome: "support_required", support }`가 오므로 그대로 돌려준다.
 * - 비밀번호는 요청 본문에만 담고 어디에도 저장하지 않는다.
 * - 예시 사건(`sample`)은 서버에 없으므로 요청 없이 게시된 것처럼 돌려준다(화면 확인용).
 *
 * @param {string} caseId 공유할 사건 ID
 * @param {{ visibility: string, title: string, body: string, tags?: string[], password?: string }} values 게시글 내용
 * @returns {Promise<{ id: string, status: string } | { outcome: 'support_required', support: object }>}
 */
export const createPost = async (caseId, { visibility, title, body, tags, password }) => {
  if (caseId === SAMPLE_CASE_ID) return { id: 'sample-post', status: 'pending_review', visibility }
  const payload = { visibility, title, body }
  if (tags?.length) payload.tags = tags
  if (password) payload.password = password
  const { data } = await apiClient.post(`/cases/${caseId}/posts`, payload)
  return data
}
