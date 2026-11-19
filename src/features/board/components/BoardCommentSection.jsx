import { useState } from 'react'

/**
 * @typedef {object} CommentItem
 * @property {string} id 댓글 ID
 * @property {string} author 작성자
 * @property {string} content 내용
 * @property {string} created_at_label 작성 시간
 * @property {number} [like_count] 공감 수
 * @property {boolean} [is_liked] 내가 공감한 댓글 여부
 * @property {boolean} [is_mine] 내가 작성한 댓글 여부
 */

/**
 * 댓글 목록 섹션.
 * 댓글 총 개수 헤더와 각 댓글 아이템(작성자, 내용, 작성시간, 공감, 옵션 메뉴)을 표시한다.
 * 내가 작성한 댓글(`is_mine`)은 옵션 메뉴에서 수정·삭제할 수 있다.
 *
 * @param {object} props
 * @param {number} props.commentCount 댓글 총 개수
 * @param {CommentItem[]} [props.comments] 댓글 목록
 * @param {(commentId: string, currentlyLiked: boolean) => void} [props.onCommentLike] 댓글 공감 핸들러
 * @param {(commentId: string) => void} [props.onCommentOptions] 댓글 옵션 핸들러
 * @param {(commentId: string, content: string) => void} [props.onEditComment] 댓글 수정 저장 핸들러
 * @param {(commentId: string) => void} [props.onDeleteComment] 댓글 삭제 핸들러
 */
export const BoardCommentSection = ({
  commentCount,
  comments = [],
  onCommentLike,
  onCommentOptions,
  onEditComment,
  onDeleteComment,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draftContent, setDraftContent] = useState('')

  const handleOptionsClick = (comment) => {
    onCommentOptions?.(comment.id)
    if (comment.is_mine && (onEditComment || onDeleteComment)) {
      setOpenMenuId((prev) => (prev === comment.id ? null : comment.id))
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setDraftContent(comment.content ?? '')
    setOpenMenuId(null)
  }

  const handleEditSubmit = (event, commentId) => {
    event.preventDefault()
    const trimmed = draftContent.trim()
    if (!trimmed) return
    onEditComment?.(commentId, trimmed)
    setEditingId(null)
    setDraftContent('')
  }

  return (
    <section className="flex flex-col pt-3 pb-24">
      <h3 className="text-base font-semibold text-black">댓글 {commentCount ?? '—'}개</h3>
      <div className="my-3 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />

      <div className="flex flex-col">
        {comments.map((comment) => {
          const isMine = Boolean(comment.is_mine)
          const isEditing = editingId === comment.id
          const isMenuOpen = openMenuId === comment.id
          const isLiked = Boolean(comment.is_liked)

          return (
            <div key={comment.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 py-2">
                <div className="flex flex-1 items-start gap-2.5">
                  <div
                    className="size-[33px] shrink-0 rounded-full bg-[#d9d9d9]"
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-base font-semibold text-black">{comment.author}</span>
                    {isEditing ? (
                      <form
                        onSubmit={(event) => handleEditSubmit(event, comment.id)}
                        className="mt-1.5 flex flex-col gap-2"
                      >
                        <textarea
                          value={draftContent}
                          onChange={(event) => setDraftContent(event.target.value)}
                          maxLength={1000}
                          rows={2}
                          aria-label="댓글 수정 입력"
                          className="w-full resize-none rounded-lg border border-line bg-field px-2.5 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="min-h-11 rounded-full border border-line px-3 text-xs text-ink focus-visible:outline-2 focus-visible:outline-focus"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            disabled={!draftContent.trim()}
                            className="min-h-11 rounded-full bg-ink px-3 text-xs font-semibold text-field disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-focus"
                          >
                            저장
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-black">{comment.content}</p>
                        <span className="mt-1 text-xs text-black">{comment.created_at_label}</span>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="relative flex shrink-0 items-center gap-3 text-xs text-black">
                    <button
                      type="button"
                      onClick={() => onCommentLike?.(comment.id, isLiked)}
                      aria-label={isLiked ? '댓글 공감 취소' : '댓글 공감'}
                      aria-pressed={isLiked}
                      className="hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      {`${isLiked ? '♥' : '♡'} ${comment.like_count ?? '—'}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOptionsClick(comment)}
                      aria-label="댓글 옵션 더보기"
                      aria-expanded={isMine ? isMenuOpen : undefined}
                      className="p-1 tracking-widest text-black hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      . . .
                    </button>

                    {isMine && isMenuOpen && (
                      <div
                        role="menu"
                        aria-label="댓글 관리"
                        className="absolute top-full right-0 z-10 mt-1 flex min-w-24 flex-col rounded-xl border border-line bg-field py-1 shadow-md"
                      >
                        {onEditComment && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => startEdit(comment)}
                            className="min-h-11 px-4 text-left text-sm text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                          >
                            댓글 수정
                          </button>
                        )}
                        {onDeleteComment && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuId(null)
                              onDeleteComment(comment.id)
                            }}
                            className="min-h-11 px-4 text-left text-sm text-red-600 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                          >
                            댓글 삭제
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="my-2 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
