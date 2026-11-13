import { useRef } from 'react'
import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'
import { getKeyboardIntensity, intensityToRatio, ratioToIntensity } from '../utils'

/** Figma 바 길이(x 87~321)와 손잡이 지름 */
const TRACK_WIDTH = 234
const THUMB_SIZE = 22

/**
 * 감정 강도 슬라이더 (Figma `2-6 감정변화`, 바 x 87~321 · y 331).
 * 패키지 없이 Pointer Events로 마우스·터치 드래그를 함께 처리한다.
 *
 * - 바의 아무 곳이나 누르면 그 위치 값으로 바로 이동하고, 누른 채 움직이면 값이 따라 바뀐다.
 * - 드래그 중에는 포인터를 이 요소에 붙잡아(pointer capture) 바 밖으로 나가도 계속 움직인다.
 * - `touch-action: none`으로 터치 드래그 중 화면이 스크롤되지 않게 한다.
 * - 키보드: ←·↓ 1 감소, →·↑ 1 증가, Home 0, End 100.
 * - 값은 0~100 정수이고, 손잡이·채운 부분 위치는 값에 비례한다.
 *
 * 요소 크기는 바 양 끝에 손잡이 반지름(11px)을 더한 256×44로, 클릭 영역이 44px 이상이다.
 * TODO(공통화 검토): 사건 접수 화면(features/case)에도 강도 슬라이더가 있다. 디자인이 같으니 공용으로 합칠지 동료와 정한다.
 *
 * @param {object} props
 * @param {number} props.value 현재 강도 (0~100)
 * @param {(value: number) => void} props.onChange 강도가 바뀌면 새 값(정수)과 함께 호출한다
 * @param {string} props.label 스크린 리더용 이름
 * @param {string} [props.className] 추가 클래스 (위치는 감싸는 요소에서 정한다)
 */
export const IntensitySlider = ({ value, onChange, label, className = '' }) => {
  const { min, max } = EMOTION_INTENSITY_RANGE
  const trackRef = useRef(null)
  const isDraggingRef = useRef(false)
  const offset = intensityToRatio(value) * TRACK_WIDTH

  /** 포인터의 화면 x 좌표를 바 위의 강도로 바꿔 알린다. */
  const updateFromPointer = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
    const next = ratioToIntensity(ratio)
    if (next !== value) onChange(next)
  }

  /** 누르면 그 위치 값으로 이동하고 드래그를 시작한다. */
  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    isDraggingRef.current = true
    updateFromPointer(event.clientX)
  }

  /** 드래그 중이면 손잡이를 포인터 위치로 옮긴다. */
  const handlePointerMove = (event) => {
    if (!isDraggingRef.current) return
    updateFromPointer(event.clientX)
  }

  /** 손을 떼거나 취소되면 드래그를 끝낸다. */
  const handlePointerEnd = (event) => {
    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  /** 키보드로 값을 바꾼다. 처리한 키는 페이지 스크롤을 막는다. */
  const handleKeyDown = (event) => {
    const next = getKeyboardIntensity(event.key, value)
    if (next === null) return
    event.preventDefault()
    if (next !== value) onChange(next)
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-orientation="horizontal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      // 키보드 focus 표시는 요소 전체(눈금 숫자와 겹침) 대신 손잡이 둘레에 그린다.
      className={`group relative h-11 w-64 cursor-pointer touch-none rounded-full select-none focus-visible:outline-none ${className}`}
    >
      {/* 값 계산 기준 영역: Figma 바 x 87~321 (요소 왼쪽에서 11px, 길이 234px) */}
      <div ref={trackRef} className="absolute top-0 left-2.75 h-full w-58.5" aria-hidden="true" />

      {/* 바: 두께 8, 둥근 끝(양쪽 4px), 그림자 (0, 1) 흐림 1.3 검정 25% */}
      <div
        className="pointer-events-none absolute top-4.25 left-1.75 h-2 w-60.5 rounded-full bg-canvas shadow-[0_1px_1.3px_rgba(0,0,0,0.25)]"
        aria-hidden="true"
      />
      {/* 채운 부분: 바 시작부터 손잡이 중심까지 */}
      <div
        className="pointer-events-none absolute top-4.25 left-1.75 h-2 rounded-full bg-sky"
        style={{ width: `${offset + 8}px` }}
        aria-hidden="true"
      />
      {/* 손잡이: 지름 22, 중심은 바 중심보다 2px 아래 (Figma 바 y 331, 손잡이 중심 y 333) */}
      <div
        // TODO(피그마 확인 필요): 키보드 focus 디자인이 없어 손잡이 안쪽에 공통 focus 색 테두리만 그린다.
        // 바깥으로 그리면 값 100일 때 오른쪽 숫자와 겹쳐서 안쪽(-4px)에 그린다.
        className="pointer-events-none absolute top-3 left-0 rounded-full border border-ink bg-canvas group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-focus"
        style={{
          width: `${THUMB_SIZE}px`,
          height: `${THUMB_SIZE}px`,
          transform: `translateX(${offset}px)`,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
