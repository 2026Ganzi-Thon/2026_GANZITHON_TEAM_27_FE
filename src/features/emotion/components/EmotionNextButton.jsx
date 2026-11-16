/**
 * 다음 버튼 (Figma x 18, y 768, 369×68). 화면 맨 아래에서 38px 위에 놓인다.
 * 이 화면의 버튼 글자색은 `#f7f7f7`(canvas)이고 화살표가 없다.
 *
 * @param {object} props
 * @param {() => void} props.onNext 다음 클릭 핸들러
 * @param {boolean} [props.isPending] 다음 단계로 넘어가는 요청 중인지 여부
 */
export const EmotionNextButton = ({ onNext, isPending = false }) => (
  <div className="mt-auto pt-6 pb-9.5">
    <button
      type="button"
      onClick={onNext}
      disabled={isPending}
      aria-busy={isPending}
      className="ml-4.5 flex h-button w-92.25 items-center justify-center rounded-full bg-ink pb-px pl-px text-base leading-[normal] font-semibold text-canvas disabled:opacity-60"
    >
      {/* Figma 글자 위치: 가로 중심 x 203, 위 y 792 (버튼 중심보다 오른쪽·위로 0.5px) */}
      {/* TODO(피그마 확인 필요): 저장 중 문구 디자인이 없다. */}
      {isPending ? '저장하는 중…' : '다음'}
    </button>
  </div>
)
