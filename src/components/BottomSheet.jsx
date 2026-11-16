import { useEffect, useId, useRef } from 'react'
import closeIconUrl from '@/assets/community/icon-close.svg'

/** 시트 안에서 Tab으로 돌 수 있는 요소 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 화면 아래에서 올라오는 시트("사건 유형", "공개 범위" 선택 등). 제목과 닫기(X) 버튼이 달려 있고, 안쪽은 `children`으로 채운다.
 *
 * - 닫기: X, 시트 바깥(어두운 배경) 클릭, Esc → `onClose`
 * - 열려 있는 동안 화면 스크롤(RootLayout의 main)을 막는다.
 * - 접근성: role="dialog", aria-modal, 제목을 aria-labelledby로 연결한다.
 *   열리면 닫기 버튼에 포커스를 두고, Tab은 시트 안에서만 돌며, 닫히면 열기 직전 포커스 위치로 돌려준다.
 * - 위치: `fixed`를 쓰지 않고 RootLayout 프레임 안을 `absolute`로 덮는다. 페이지 최상위 요소에 `relative`가 없어야 한다.
 *   (`RecessModal`과 같은 방식이다.)
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   onClose: () => void,
 *   children: import('react').ReactNode,
 * }} props
 * - `open`: 열림 여부
 * - `title`: 시트 제목
 * - `onClose`: 닫을 때 호출한다
 */
export const BottomSheet = ({ open, title, onClose, children }) => {
  const titleId = useId()
  const overlayRef = useRef(null)
  const sheetRef = useRef(null)
  const closeRef = useRef(null)
  // 핸들러가 바뀌어도 효과를 다시 걸지 않도록 최신 onClose를 ref로 둔다.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // 열릴 때: 포커스 저장·이동, 스크롤 잠금, Esc 처리. 닫힐 때: 모두 되돌린다.
  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const scroller = overlayRef.current?.closest('main') ?? document.scrollingElement
    const previousOverflow = scroller?.style.overflow ?? ''
    if (scroller) scroller.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (scroller) scroller.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  if (!open) return null

  /** Tab·Shift+Tab이 시트 밖으로 나가지 않게 처음과 끝에서 반대쪽으로 돌린다. */
  const handleSheetKeyDown = (event) => {
    if (event.key !== 'Tab') return
    const items = [...sheetRef.current.querySelectorAll(FOCUSABLE)]
    if (items.length === 0) return
    const first = items[0]
    const last = items.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /** 시트 바깥(어두운 배경)을 누르면 닫는다. 시트 안 클릭은 무시한다. */
  const handleOverlayClick = (event) => {
    if (!sheetRef.current?.contains(event.target)) onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-end bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleSheetKeyDown}
        className="w-full rounded-t-[20px] bg-white pt-3.5 pb-6.75 text-ink"
      >
        <div className="flex h-6 items-center justify-between px-4">
          <h2 id={titleId} className="text-base leading-[normal] font-semibold">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-my-2.5 -mr-2.5 flex size-11 items-center justify-center"
          >
            <img src={closeIconUrl} alt="" width={24} height={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
