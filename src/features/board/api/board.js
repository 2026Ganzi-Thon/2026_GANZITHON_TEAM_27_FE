import { mapBoardPost } from '@/api/mapBoardPost'
import { apiClient } from '@/lib/apiClient'
import { resolveMock, USE_BOARD_MOCK } from '../mocks/boardMocks'

/**
 * 게시글 상세 정보를 조회한다. `GET /board/posts/{pid}`
 * 남의 비공개·검토중·숨김 글은 `404`다(비공개 글은 `unlockPost`로 비밀번호를 보내 연다).
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<import('@/api/mapBoardPost').BoardPostViewModel>} 게시글 상세 정보
 */
export const fetchPostDetail = async (postId) => {
  const { data } = await apiClient.get(`/board/posts/${encodeURIComponent(postId)}`)
  return mapBoardPost(data)
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
 * 게시글 공감(좋아요) 토글 요청. `POST /board/posts/{pid}/like` → `{ is_liked, like_count }`
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<{ is_liked: boolean, like_count: number }>}
 */
export const togglePostLike = async (postId) => {
  if (USE_BOARD_MOCK) return resolveMock({ success: true })
  const { data } = await apiClient.post(`/board/posts/${encodeURIComponent(postId)}/like`)
  return data
}

/**
 * 댓글 등록 요청. `POST /board/posts/{pid}/comments` `{ content }` → `201` 댓글
 * (`{ id, author, content, created_at, is_mine }`)
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
  const { data } = await apiClient.post(`/board/posts/${encodeURIComponent(postId)}/comments`, body)
  return data
}

/**
 * 사건 없이 게시판에 바로 글을 쓴다. `POST /board/posts` `{ visibility, title, body, password? }`
 * → `201 { id, status, visibility, created_at }`. 위기 신호가 감지되면 HTTP 200 `{ outcome: "support_required" }`.
 * 비밀번호는 요청 본문에만 담는다.
 *
 * @param {{ visibility: string, title: string, body: string, password?: string }} values 글 내용
 * @returns {Promise<object>} 서버 응답
 */
export const createBoardPost = async ({ visibility, title, body, password }) => {
  if (USE_BOARD_MOCK) return resolveMock({ id: `post-${Date.now()}`, status: 'pending_review' })
  const payload = { visibility, title, body }
  if (password) payload.password = password
  const { data } = await apiClient.post('/board/posts', payload)
  return data
}
