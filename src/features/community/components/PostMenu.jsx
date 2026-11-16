import { useEffect, useRef, useState } from 'react'

/**
 * 내 글 오른쪽 위의 "···" 메뉴. 누르면 "수정하기", "삭제하기"가 나온다. 바깥을 누르거나 Esc를 누르면 닫힌다.
 *
 * TODO(피그마 확인 필요): 글 수정 화면이 시안에 없어서 "수정하기"는 누를 수 없게 두었다.
 *
 * @param {{ onDelete: () => void }} props
 * - `onDelete`: "삭제하기"를 누르면 호출한다
 */
export const PostMenu = ({ onDelete }) => {
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
          <button type="button" role="menuitem" disabled className="block h-5 w-full text-left">
            수정하기
          </button>
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
