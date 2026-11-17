import { clearMockInteractions } from '@/lib/mockBoardInteractions'
import { readPosts, wait, writePosts } from './mockPostStore'

/**
 * 게시글 삭제. 내가 올린 글을 저장소에서 지우고, 그 글의 공감·댓글 기록도 함께 지운다.
 *
 * TODO(API 확인 필요): 게시글을 지우는 API가 명세에 없다(사건을 지우면 그 사건의 글도 함께 지워진다고만 되어 있다).
 * 글 삭제 API가 정해지면 `apiClient`로 바꾼다.
 *
 * @param {string} postId 삭제할 게시글 ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  await wait()
  writePosts(readPosts().filter((post) => post.id !== postId))
  clearMockInteractions(postId)
}
