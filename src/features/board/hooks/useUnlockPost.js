import { useState } from 'react'
import { unlockPost } from '../api/board'

/**
 * 비밀번호로 비공개 글을 여는 hook (`POST /board/posts/{pid}/unlock`).
 *
 * 비밀번호가 요청에 들어가므로 TanStack Query(캐시에 남는다)를 쓰지 않고, 연 글도 이 hook 안의 상태로만 둔다.
 * (명세: 비밀번호를 URL·캐시·전역 상태에 저장하지 않는다. 응답도 `Cache-Control: no-store`)
 * 연 글은 상세 조회(`GET`)로 다시 받을 수 없어서, 공감·댓글 결과는 `applyLike`·`appendComment`로 이 상태에 반영한다.
 *
 * @param {string | undefined} postId 게시글 ID
 * @returns {{
 *   post: import('@/api/mapBoardPost').BoardPostViewModel | null,
 *   unlock: (password: string) => Promise<boolean>,
 *   isPending: boolean,
 *   errorMessage: string | null,
 *   applyLike: (result: { is_liked?: boolean, like_count?: number }) => void,
 *   appendComment: (comment: object) => void,
 * }}
 */
export const useUnlockPost = (postId) => {
  const [post, setPost] = useState(null)
  const [isPending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  /** 비밀번호를 보내 글을 연다. 성공하면 `true`. 실패해도 예외를 던지지 않고 `errorMessage`로 알린다. */
  const unlock = async (password) => {
    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.')
      return false
    }
    setPending(true)
    setErrorMessage(null)
    try {
      setPost(await unlockPost(postId, password))
      setPending(false)
      return true
    } catch (error) {
      const status = error?.response?.status
      setPending(false)
      setErrorMessage(
        status === 404
          ? '비밀번호가 맞지 않거나 열람할 수 없는 글이에요.'
          : status === 429
            ? '시도가 많아요. 잠시 후 다시 시도해 주세요.'
            : '글을 열지 못했어요. 다시 시도해 주세요.',
      )
      return false
    }
  }

  /** 공감 토글 응답(`{ is_liked, like_count }`)을 연 글에 반영한다. */
  const applyLike = (result) =>
    setPost((prev) =>
      prev
        ? {
            ...prev,
            is_liked: typeof result?.is_liked === 'boolean' ? result.is_liked : prev.is_liked,
            like_count:
              typeof result?.like_count === 'number' ? result.like_count : prev.like_count,
          }
        : prev,
    )

  /** 새 댓글을 연 글에 덧붙인다. */
  const appendComment = (comment) =>
    setPost((prev) =>
      prev && comment && typeof comment === 'object'
        ? {
            ...prev,
            comments: [...(prev.comments ?? []), { ...comment, created_at_label: '방금 전' }],
            comment_count: (prev.comment_count ?? prev.comments?.length ?? 0) + 1,
          }
        : prev,
    )

  return { post, unlock, isPending, errorMessage, applyLike, appendComment }
}
