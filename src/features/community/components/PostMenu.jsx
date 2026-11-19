import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * 내 글 오른쪽 위의 "···" 메뉴. 누르면 "수정하기", "삭제하기"가 나온다. 바깥을 누르거나 Esc를 누르면 닫힌다.
 *
 * @param {{ editTo?: string, onEdit?: () => void, onDelete: () => void }} props
 * - `editTo`: "수정하기"를 눌렀을 때 이동할 게시글 수정 주소
 * - `onEdit`: `editTo`가 없을 때 "수정하기" 클릭 핸들러
 * - `onDelete`: "삭제하기"를 누르면 호출한다
 */
export const PostMenu = ({ editTo, onEdit, onDelete }) => {
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

  return (
    <div
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
      className="absolute top-2.5 right-1.5 z-10"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="글 메뉴"
        aria-expanded={open}
        className="flex size-11 items-start justify-center pt-2 text-xs leading-[normal] text-black"
      >
        ···
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-9 right-1.5 z-10 w-16.75 rounded-[9px] bg-[rgba(117,117,117,0.2)] px-3 py-1 text-xs leading-[normal] text-black backdrop-blur-sm"
        >
          {editTo ? (
            <Link
              to={editTo}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-5 w-full items-center text-left"
            >
              수정하기
            </Link>
          ) : (
            <button
              type="button"
              role="menuitem"
              disabled={!onEdit}
              onClick={() => {
                setOpen(false)
                onEdit?.()
              }}
              className="block h-5 w-full text-left"
            >
              수정하기
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
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
