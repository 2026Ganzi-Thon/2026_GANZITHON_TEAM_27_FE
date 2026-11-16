import { readPosts, wait } from './mockPostStore'

/**
 * 게시글 하나 조회. `GET /board/posts/{id}`와 같은 역할을 한다. 없으면 `null`을 돌려준다.
 * 목업 저장소에는 내가 올린 글만 있어서, 남이 올린 글은 찾을 수 없다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.get(`/board/posts/${id}`)`로 바꾼다. 없는 글은 `404`로 온다.
 *
 * @param {string} postId 게시글 ID
 * @returns {Promise<{ id: string, title: string, body: string, tags: string[], visibility: string, status: string, created_at: string } | null>}
 */
export const getPost = async (postId) => {
  await wait()
  const post = readPosts().find((item) => item.id === postId)
  if (!post) return null
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    tags: post.tags ?? [],
    visibility: post.visibility,
    status: post.status,
    created_at: post.created_at,
  }
}
