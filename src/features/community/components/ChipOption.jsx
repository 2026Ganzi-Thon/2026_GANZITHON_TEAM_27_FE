/**
 * 시트 안의 선택 칩 하나("흑백논리", "내 글만 보기" 등). 선택되면 검은 배경에 흰 글자가 된다.
 *
 * @param {{ label: string, selected: boolean, onToggle: () => void }} props
 * - `selected`: 선택되어 있는지
 * - `onToggle`: 누르면 호출한다
 */
export const ChipOption = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={selected}
    className={`rounded-[44px] border border-black px-2.5 py-1.5 text-xs leading-[normal] ${
      selected ? 'bg-black text-white' : 'text-black'
    }`}
  >
    {label}
  </button>
)
