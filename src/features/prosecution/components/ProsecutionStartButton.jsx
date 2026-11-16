import chevronRightUrl from '@/assets/prosecution/chevron-right.svg'

/**
 * 변론 시작 버튼 (Figma x 18, y 768, 369×68). 화면 맨 아래에서 38px 위에 놓인다.
 *
 * @param {object} props
 * @param {() => void} props.onStart "변론 시작" 클릭 핸들러
 * @param {boolean} [props.isLoading] 변론으로 넘어가는 요청 중인지 여부
 * @param {boolean} [props.disabled] 버튼 비활성화 여부
 */
export const ProsecutionStartButton = ({ onStart, isLoading = false, disabled = false }) => (
  <div className="mt-auto pt-6 pb-9.5">
    <button
      type="button"
      onClick={onStart}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      className="relative flex h-button w-full translate-x-px items-center justify-center rounded-full bg-ink pb-px pl-px text-base leading-auto font-semibold text-field disabled:opacity-60"
    >
      {/* Figma 글자 위치: 가로 중심 x 203, 위 y 792 (버튼 중심보다 오른쪽·위로 0.5px) */}
      <span>{isLoading ? '변론 준비 중…' : '변론 시작'}</span>
      {/* 아래 방향 화살표 원본(19×10)을 Figma처럼 -90° 돌려 오른쪽 화살표로 쓴다. Figma 위치: x 341, y 792 */}
      <span className="absolute top-6 right-9 flex h-4.75 w-2.5 items-center justify-center">
        <img
          src={chevronRightUrl}
          alt=""
          width={19}
          height={10}
          className="max-w-none -rotate-90"
        />
      </span>
    </button>
  </div>
)
