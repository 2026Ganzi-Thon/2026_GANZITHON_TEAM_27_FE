// 기소 화면 "변론 시작" 버튼과 같은 화살표다(렌더 비교 차이 0%). 복사하지 않고 그대로 가져다 쓴다.
import chevronRightUrl from '@/assets/prosecution/chevron-right.svg'

/**
 * 사건파일 저장하기 버튼 (Figma x 18, y 768, 369×68). 화면 맨 아래에서 38px 위에 놓인다.
 *
 * @param {object} props
 * @param {() => void} props.onSave 저장 클릭 핸들러
 * @param {boolean} [props.isSaving] 저장 요청 중인지 여부
 * @param {boolean} [props.disabled] 버튼 비활성화 여부
 */
export const DecisionSaveButton = ({ onSave, isSaving = false, disabled = false }) => (
  <div className="mt-auto pt-6 pb-9.5">
    <button
      type="button"
      onClick={onSave}
      disabled={isSaving || disabled}
      aria-busy={isSaving}
      className="relative ml-px flex h-button w-92.25 items-center justify-center rounded-full bg-ink pb-px pl-0.5 text-base leading-auto font-semibold text-field disabled:opacity-60"
    >
      {/* Figma 글자 위치: 가로 중심 x 203.5, 위 y 792 (버튼 중심보다 오른쪽 1px·위 0.5px) */}
      {/* TODO(피그마 확인 필요): 저장 중 문구 디자인이 없다. */}
      <span>{isSaving ? '저장하는 중…' : '사건파일 저장하기'}</span>
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
