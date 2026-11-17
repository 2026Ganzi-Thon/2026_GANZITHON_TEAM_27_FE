import { useState } from 'react'
import { BoardOptionsMenu } from './BoardOptionsMenu'

/**
 * @typedef {object} CommentItem
 * @property {string} id 댓글 ID
 * @property {string} author 작성자
 * @property {string} content 내용
 * @property {string} created_at_label 작성 시간
 * @property {number} [like_count] 공감 수
 * @property {boolean} [is_liked] 내가 공감했는지
 * @property {boolean} [mine] 내가 단 댓글인지(고치고 지울 수 있다)
 */

/**
 * 댓글 목록 섹션.
 * 댓글 총 개수 헤더와 각 댓글 아이템(작성자, 내용, 작성시간, 공감, 옵션 메뉴)을 표시한다.
 * 내 댓글(`mine`)은 "···"를 눌러 수정하기·삭제하기를 쓸 수 있고, 수정하기를 누르면 그 자리에서 고친다.
 *
 * @param {object} props
 * @param {number} props.commentCount 댓글 총 개수
 * @param {CommentItem[]} [props.comments] 댓글 목록
 * @param {(commentId: string) => void} [props.onCommentLike] 댓글 공감 핸들러
 * @param {(commentId: string) => void} [props.onCommentOptions] 댓글 옵션 핸들러
 * @param {(commentId: string, content: string) => void} [props.onCommentEdit] 내 댓글 수정 저장 핸들러
 * @param {(commentId: string) => void} [props.onCommentDelete] 내 댓글 삭제 핸들러
 */
export const BoardCommentSection = ({
  commentCount,
  comments = [],
  onCommentLike,
  onCommentOptions,
  onCommentEdit,
  onCommentDelete,
}) => {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')

  /** 수정 중인 내용을 저장한다. 비어 있으면 저장하지 않는다. */
  const saveEdit = (event) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content) return
    onCommentEdit?.(editingId, content)
    setEditingId(null)
  }

  return (
    <section className="flex flex-col pt-3 pb-24">
      <h3 className="text-base font-semibold text-black">댓글 {commentCount ?? '—'}개</h3>
      <div className="my-3 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />

      <div className="flex flex-col">
        {comments.map((comment) => (
          <div key={comment.id} className="flex flex-col">
            <div className="flex items-start justify-between py-2">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <div
                  className="size-[33px] shrink-0 rounded-full bg-[#d9d9d9]"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base font-semibold text-black">{comment.author}</span>
                  {editingId === comment.id ? (
                    <form onSubmit={saveEdit} className="mt-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        aria-label="댓글 수정"
                        className="h-9 w-full rounded-[5px] bg-field px-3 text-sm text-black focus:outline-none"
                      />
                      <div className="flex gap-2 text-xs">
                        <button
                          type="submit"
                          disabled={!draft.trim()}
                          className="h-8 rounded-full bg-ink px-4 font-semibold text-field disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="h-8 rounded-full bg-field px-4 font-semibold text-black"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-1 text-sm text-black">{comment.content}</p>
                  )}
                  <span className="mt-1 text-xs text-black">{comment.created_at_label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-black">
                <button
                  type="button"
                  onClick={() => onCommentLike?.(comment.id)}
                  aria-pressed={comment.is_liked ?? false}
                  className={`hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus ${
                    comment.is_liked ? 'font-semibold' : ''
                  }`}
                >
                  {`♡ ${comment.like_count ?? '—'}`}
                </button>
                <BoardOptionsMenu
                  label="댓글 옵션 더보기"
                  isMine={Boolean(comment.mine)}
                  onOptionsClick={() => onCommentOptions?.(comment.id)}
                  onEdit={() => {
                    setDraft(comment.content)
                    setEditingId(comment.id)
                  }}
                  onDelete={() => onCommentDelete?.(comment.id)}
                />
              </div>
            </div>
            <div className="my-2 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  )
}
