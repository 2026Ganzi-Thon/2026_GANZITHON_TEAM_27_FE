/**
 * 행동 카드 하나 (제목 / 설명 / 태그). 하나만 고를 수 있어 라디오 버튼으로 만들었다.
 * 같은 `name`의 라디오끼리 묶여서 키보드 화살표로 카드 사이를 옮겨 다니며 고를 수 있다.
 *
 * - 선택된 카드: 진회색(`ink`) 배경에 흰 글자 (Figma 카드 2)
 * - 나머지 카드: 기본 회색(`field`) 배경
 *   TODO(피그마 확인 필요): Figma 카드 3의 회청색(#bbc3c4)은 의미가 불분명해 기본 회색으로 둔다.
 *
 * @param {object} props
 * @param {string} props.name 라디오 묶음 이름
 * @param {{ id: string, title: string, description: string, tag: string }} props.option 카드 내용
 * @param {boolean} props.checked 선택되어 있는지
 * @param {(id: string) => void} props.onChange 고르면 카드 id와 함께 호출한다
 * @param {boolean} [props.disabled] 저장 중에는 바꿀 수 없다
 */
export const ActionOption = ({ name, option, checked, onChange, disabled = false }) => (
  <label className="relative block h-19.25 cursor-pointer has-disabled:cursor-default">
    <input
      type="radio"
      name={name}
      value={option.id}
      checked={checked}
      disabled={disabled}
      onChange={() => onChange(option.id)}
      aria-label={`${option.title}, ${option.description}, ${option.tag}`}
      className="peer sr-only"
    />
    <span className="absolute inset-0 rounded-field bg-field peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
    {/* 보이는 글자는 장식이고, 읽어 주는 이름은 input의 aria-label로 준다(글자 사이 구분이 없어서). */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-ink peer-checked:text-white"
    >
      <span className="absolute top-2.75 left-[5.83px] text-base leading-[normal] font-semibold">
        {option.title}
      </span>
      <span className="absolute top-[33.5px] left-1.75 text-xs leading-[normal]">
        {option.description}
      </span>
      <span className="absolute top-[55.97px] left-[8.03px] text-tag leading-[normal]">
        {option.tag}
      </span>
    </span>
  </label>
)
