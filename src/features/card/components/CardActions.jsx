const ACTION_BUTTON =
  'h-13.5 rounded-[41px] bg-ink text-base font-semibold text-canvas disabled:opacity-40'

/**
 * 사건 카드 아래의 "이미지 저장", "공유하기" 버튼.
 *
 * @param {{
 *   onSave: () => void,
 *   onShare: () => void,
 *   disabled?: boolean,
 * }} props
 * - `disabled`: 카드 이미지가 아직 없으면 `true`로 두어 누를 수 없게 한다
 */
export const CardActions = ({ onSave, onShare, disabled = false }) => (
  <div className="grid grid-cols-2 gap-1.75">
    <button type="button" onClick={onSave} disabled={disabled} className={ACTION_BUTTON}>
      이미지 저장
    </button>
    <button type="button" onClick={onShare} disabled={disabled} className={ACTION_BUTTON}>
      공유하기
    </button>
  </div>
)
