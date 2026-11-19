import { useState } from 'react'

/**
 * 게시글 본문 섹션.
 * 게시글 제목, 작성자 아바타 및 메타 정보(익명, 시간, 공감 수, 더보기), 본문 텍스트를 표시한다.
 * 내가 쓴 글(`isMine`)이면 옵션 메뉴에서 수정·삭제를 할 수 있다.
 *
 * @param {object} props
 * @param {string} props.title 게시글 제목
 * @param {string} props.content 게시글 본문
 * @param {string} [props.author] 작성자명
 * @param {string} [props.createdAtLabel] 작성 시간 표시
 * @param {number} [props.likeCount] 공감 수
 * @param {boolean} [props.isMine] 내가 작성한 글 여부
 * @param {() => void} [props.onOptionsClick] 더보기 메뉴 클릭 핸들러
 * @param {(values: { title: string, body: string }) => void} [props.onEditPost] 게시글 수정 저장 핸들러
 * @param {() => void} [props.onDeletePost] 게시글 삭제 확인 핸들러
 * @param {boolean} [props.isUpdating] 게시글 수정 중 여부
 * @param {boolean} [props.isDeleting] 게시글 삭제 중 여부
 */
export const BoardPostContent = ({
  title,
  content,
  author,
  createdAtLabel,
  likeCount,
  isMine = false,
  onOptionsClick,
  onEditPost,
  onDeletePost,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title ?? '')
  const [draftBody, setDraftBody] = useState(content ?? '')

  const canManage = isMine && Boolean(onEditPost || onDeletePost)
  const canSave = Boolean(draftTitle.trim() && draftBody.trim()) && !isUpdating

  const handleOptions = () => {
    onOptionsClick?.()
    if (canManage) {
      setMenuOpen((prev) => !prev)
      setConfirmDelete(false)
    }
  }

  const startEdit = () => {
    setDraftTitle(title ?? '')
    setDraftBody(content ?? '')
    setEditing(true)
    setMenuOpen(false)
    setConfirmDelete(false)
  }

  const handleEditSubmit = (event) => {
    event.preventDefault()
    if (!canSave) return
    onEditPost?.({ title: draftTitle.trim(), body: draftBody.trim() })
    setEditing(false)
  }

  return (
    <article className="flex flex-col pt-3">
      {editing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={120}
            aria-label="게시글 제목 수정"
            placeholder="제목을 입력해 주세요"
            className="w-full rounded-xl border border-line bg-field px-3 py-2 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-focus"
          />
          <textarea
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            maxLength={2000}
            rows={5}
            aria-label="게시글 본문 수정"
            placeholder="본문을 입력해 주세요"
            className="w-full resize-none rounded-xl border border-line bg-field px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus"
          />
          <p className="text-xs text-muted">수정하면 다시 검토 대기 상태가 돼요.</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isUpdating}
              className="min-h-11 rounded-full border border-line px-4 text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-field disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-focus"
            >
              {isUpdating ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-[24px] font-semibold leading-tight text-black">{title}</h2>

          <div className="mt-4.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-[33px] shrink-0 rounded-full bg-[#d9d9d9]" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-black">{author}</span>
                <span className="text-xs font-normal text-black">{createdAtLabel}</span>
              </div>
            </div>

            <div className="relative flex items-center gap-3 text-xs font-normal text-black">
              <span>{`♡ ${likeCount ?? '—'}`}</span>
              <button
                type="button"
                onClick={handleOptions}
                aria-label="게시글 옵션 더보기"
                aria-expanded={canManage ? menuOpen : undefined}
                className="p-1 tracking-widest text-black hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
              >
                . . .
              </button>

              {canManage && menuOpen && (
                <div
                  role="menu"
                  aria-label="게시글 관리"
                  className="absolute top-full right-0 z-10 mt-1 flex min-w-24 flex-col rounded-xl border border-line bg-field py-1 shadow-md"
                >
                  {onEditPost && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={startEdit}
                      className="min-h-11 px-4 text-left text-sm text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      글 수정
                    </button>
                  )}
                  {onDeletePost && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmDelete(true)
                      }}
                      className="min-h-11 px-4 text-left text-sm text-red-600 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      글 삭제
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {confirmDelete && (
            <div
              role="alertdialog"
              aria-label="게시글 삭제 확인"
              className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-line bg-field px-3 py-2 text-xs text-ink"
            >
              <span>이 게시글을 삭제할까요?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="min-h-11 rounded-full border border-line px-3 text-xs text-ink focus-visible:outline-2 focus-visible:outline-focus"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePost?.()}
                  disabled={isDeleting}
                  className="min-h-11 rounded-full bg-red-600 px-3 text-xs font-semibold text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-focus"
                >
                  {isDeleting ? '삭제 중…' : '삭제 확인'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 whitespace-pre-line text-sm leading-[1.3] text-black">{content}</div>
        </>
      )}
    </article>
  )
}
