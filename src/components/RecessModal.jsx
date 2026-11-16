import { useEffect, useId, useRef } from 'react'
// Figma에서 내보낸 SVG다(저울 1:1627, X 1:1617).
import closeIconUrl from '@/assets/recess/icon-close.svg'
import scaleIconUrl from '@/assets/recess/icon-scale.svg'

/** 모달 안에서 Tab으로 돌 수 있는 요소 */
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

/**
 * 휴정 안내 모달 (Figma `2-1 기소` 위 모달 1:1613, 346×410).
 * 법정 화면(기소, 변론 챗봇 등)에서 뒤로가기를 누르면 띄우는 공용 창이다.
 * "휴정하기"는 `onConfirm`만 부르고, API 호출·화면 이동은 쓰는 화면에서 정한다.
 *
 * - 닫기: X, "취소", 모달 바깥(헤더 영역 포함) 클릭, Esc → `onCancel`
 * - 배경: `backdropTop`(기본 110 = 상태바 44 + 헤더 66) 아래만 흐리게 한다. Figma처럼 헤더는 선명하게 남지만,
 *   열려 있는 동안 헤더를 누르면 바깥 클릭으로 보고 닫는다.
 * - 열려 있는 동안 화면 스크롤(RootLayout의 main)을 막는다.
 * - 접근성: role="dialog", aria-modal, 제목·안내를 aria-labelledby·describedby로 연결한다.
 *   열리면 "취소"에 포커스를 두고, Tab은 모달 안에서만 돌며, 닫히면 열기 직전 포커스 위치로 돌려준다.
 * - 위치: `fixed`를 쓰지 않고 RootLayout 프레임 안을 `absolute`로 덮는다. 페이지 최상위 요소에 `relative`가 없어야 한다.
 *
 * TODO(피그마 확인 필요): 휴정 처리 중(요청 중) 모양이 없어 `isConfirming`이면 버튼만 비활성화한다.
 * TODO(피그마 확인 필요): 작성 중이던 입력을 임시 저장할지 묻는 단계가 없다(명세: 사용자가 선택할 때만 저장).
 *
 * @param {object} props
 * @param {boolean} props.open 열림 여부
 * @param {() => void} props.onConfirm "휴정하기" 핸들러
 * @param {() => void} props.onCancel 닫기 핸들러 (X, 취소, 바깥 클릭, Esc)
 * @param {number} [props.backdropTop] 배경 블러를 시작할 y(px). 화면마다 헤더 높이가 다르면 바꾼다.
 * @param {boolean} [props.isConfirming] 휴정 처리 중이면 true
 */
export const RecessModal = ({
  open,
  onConfirm,
  onCancel,
  backdropTop = 110,
  isConfirming = false,
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  // 이벤트 핸들러가 바뀌어도 효과를 다시 걸지 않도록 최신 onCancel을 ref로 둔다.
  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  })

  // 열릴 때: 포커스 저장·이동, 스크롤 잠금, Esc 처리. 닫힐 때: 모두 되돌린다.
  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const scroller = overlayRef.current?.closest('main') ?? document.scrollingElement
    const previousOverflow = scroller?.style.overflow ?? ''
    if (scroller) scroller.style.overflow = 'hidden'
    cancelRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
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

  /** Tab·Shift+Tab이 모달 밖으로 나가지 않게 처음과 끝에서 반대쪽으로 돌린다. */
  const handleDialogKeyDown = (event) => {
    if (event.key !== 'Tab') return
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
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

  /** 모달 바깥(배경·헤더 영역)을 누르면 닫는다. 모달 안 클릭은 무시한다. */
  const handleOverlayClick = (event) => {
    if (!dialogRef.current?.contains(event.target)) onCancel()
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Figma 배경: 헤더 아래 요소들에 블러 55 + 투명도 30% → 헤더 아래 전체를 흐리게 하고 canvas 70%로 덮는다 */}
      <div
        className="absolute inset-x-0 bottom-0 bg-canvas/70 backdrop-blur-recess"
        style={{ top: backdropTop }}
        aria-hidden="true"
      />

      {/* Figma 모달: x 28, y 255, 346×410 — 874px 화면 가운데보다 23px 아래 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleDialogKeyDown}
        className="relative h-102.5 w-86.5 translate-y-5.75 rounded-modal bg-card-gray text-black"
      >
        {/* X: Figma 그룹 (308, 39) 15.27×15, 내보낸 아이콘(19×18)은 선 끝 둥근 부분까지 포함해 (306.5, 37.5) */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="닫기"
          className="absolute top-[24.5px] left-73.5 flex size-11 items-center justify-center"
        >
          <img src={closeIconUrl} alt="" width={19} height={18} className="max-w-none" />
        </button>

        {/* 저울: Figma (148, 65) 54×48 */}
        <img
          src={scaleIconUrl}
          alt=""
          width={54}
          height={48}
          className="absolute top-16.25 left-37 max-w-none"
        />

        {/* 제목: Figma (82, 139) 20px SemiBold */}
        <h2
          id={titleId}
          className="absolute top-34.75 left-20.5 text-xl leading-[normal] font-semibold whitespace-nowrap"
        >
          지금은 잠시 휴정할까요?
        </h2>
        {/* 안내: Figma (97, 170) 163×37, 14px 가운데 정렬 두 줄 (문구 그대로: 첫 줄 끝 공백 포함)
            Figma는 두 줄 사이가 20px(첫 줄 글자 y 427, 둘째 줄 447)이라 줄 높이 20px로 두고,
            늘어난 줄 높이만큼 상자를 2px 올려 첫 줄 위치를 맞춘다. */}
        <p
          id={descriptionId}
          className="absolute top-42 left-24.25 w-40.75 text-center text-sm leading-5 whitespace-pre-wrap"
        >
          {'오늘의 재판을 멈추고 \n나중에 다시 시작할 수 있어요.'}
        </p>

        {/* 휴정하기: Figma (22, 251) 302×61.66, #1f1f1f, 글자 #e7e7e7
            Figma 글자 상자(높이 15)가 실제 줄 높이(19)보다 작아 글자가 가운데보다 2px 아래에 있다 → 위 여백 4px */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          aria-busy={isConfirming}
          className="absolute top-62.75 left-5.5 flex h-modal-button w-75.5 items-center justify-center rounded-modal bg-ink-deep pt-1 text-base leading-[normal] font-semibold text-field disabled:opacity-60"
        >
          휴정하기
        </button>
        {/* 취소: Figma (22, 328) 302×61.66, 흰색, 글자 #010101(→ black)
            휴정하기와 같이 글자를 2px 내리고(위 여백 4px), Figma 글자 위치(x 187)에 맞춰 1px 왼쪽으로(오른쪽 여백 2px) */}
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="absolute top-82 left-5.5 flex h-modal-button w-75.5 items-center justify-center rounded-modal bg-surface pt-1 pr-0.5 text-base leading-[normal] font-semibold text-black"
        >
          취소
        </button>
      </div>
    </div>
  )
}
