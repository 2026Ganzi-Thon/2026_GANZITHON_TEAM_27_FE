import { useEffect, useRef, useState } from 'react'

/**
 * 글·댓글 오른쪽의 "···" 옵션 버튼. 내 글·댓글이면 누를 때 "수정하기", "삭제하기" 메뉴가 열린다.
 * 바깥을 누르거나 Esc를 누르면 닫힌다. 남의 글·댓글이면 메뉴 없이 `onOptionsClick`만 부른다.
 *
 * @param {object} props
 * @param {string} props.label 버튼의 접근 가능한 이름 (예: `게시글 옵션 더보기`)
 * @param {boolean} [props.isMine] 내 글·댓글인지. 맞을 때만 메뉴가 열린다
 * @param {() => void} [props.onOptionsClick] 버튼을 누르면 호출한다
 * @param {() => void} [props.onEdit] "수정하기"를 누르면 호출한다
 * @param {() => void} [props.onDelete] "삭제하기"를 누르면 호출한다
 */
export const BoardOptionsMenu = ({ label, isMine = false, onOptionsClick, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  // 열려 있는 동안 바깥 클릭과 Esc로 닫는다.
  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleClick = () => {
    onOptionsClick?.()
    if (isMine) setOpen((current) => !current)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-haspopup={isMine ? 'menu' : undefined}
        aria-expanded={isMine ? open : undefined}
        className="p-1 tracking-widest text-black hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
      >
        . . .
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-8 right-0 z-10 w-16.75 rounded-[9px] bg-[rgba(117,117,117,0.2)] px-3 py-1 text-xs leading-[normal] text-black backdrop-blur-sm"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit?.()
            }}
            className="block h-5 w-full text-left"
          >
            수정하기
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete?.()
            }}
            className="block h-5 w-full border-t border-[#757575]/60 text-left"
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  )
}
