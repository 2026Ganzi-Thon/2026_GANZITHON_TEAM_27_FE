import { VISIBILITY } from '@/constants/visibility'
import { readPosts, wait, writePosts } from './mockPostStore'

/**
 * 게시글 수정. 내가 올린 글의 제목·본문·공개 범위를 바꾼다. 올린 시각과 검토 상태는 그대로다.
 * 비밀번호 자체는 저장하지 않고, 비밀번호가 있는지(`has_password`)만 남긴다.
 *
 * TODO(API 확인 필요): 게시글 수정 API(`PATCH /board/posts/{id}`)가 명세에 없다.
 * 수정을 지원하면 `apiClient.patch`로 바꾸고, 지원하지 않으면 "수정하기" 메뉴를 뺀다.
 *
 * @param {string} postId 수정할 게시글 ID
 * @param {{ title: string, body: string, visibility: string, password?: string }} values 바꿀 내용
 * @returns {Promise<{ id: string } | null>} 수정한 글의 ID. 없는 글이면 `null`
 */
export const updatePost = async (postId, { title, body, visibility, password }) => {
  await wait()

  const posts = readPosts()
  if (!posts.some((post) => post.id === postId)) return null

  writePosts(
    posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            title,
            body,
            visibility,
            has_password: visibility === VISIBILITY.passwordProtected && Boolean(password),
          }
        : post,
    ),
  )
  return { id: postId }
}
