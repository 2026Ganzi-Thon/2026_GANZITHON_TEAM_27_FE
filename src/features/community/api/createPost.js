import { VISIBILITY } from '@/constants/visibility'
import { readPosts, wait, writePosts } from './mockPostStore'

/**
 * 사건을 게시판에 공유한다. `POST /cases/{id}/posts`와 같은 모양으로 응답한다.
 * 글은 `pending_review`(검토 중)로 시작한다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.post(`/cases/${caseId}/posts`, { visibility, title, body, tags, password })`로 바꾼다.
 * TODO(API 확인 필요): 위기 상황이면 `outcome: "support_required"`가 올 수 있다. 응답 구조가 확정되면 처리한다.
 *
 * @param {string} caseId 공유할 사건 ID
 * @param {{ visibility: string, title: string, body: string, tags?: string[], password?: string }} values 게시글 내용
 * @returns {Promise<{ id: string, status: 'pending_review' }>}
 */
export const createPost = async (caseId, { visibility, title, body, tags = [], password }) => {
  await wait()

  const post = {
    id: crypto.randomUUID(),
    case_id: caseId,
    visibility,
    title,
    body,
    tags,
    // 비밀번호 자체는 저장하지 않는다.
    has_password: visibility === VISIBILITY.passwordProtected && Boolean(password),
    status: 'pending_review',
    created_at: new Date().toISOString(),
  }
  writePosts([post, ...readPosts()])
  return { id: post.id, status: post.status }
}
