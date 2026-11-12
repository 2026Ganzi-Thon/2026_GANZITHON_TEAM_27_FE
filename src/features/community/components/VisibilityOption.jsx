import radioOffUrl from '@/assets/share/radio-off.svg'
import radioOnUrl from '@/assets/share/radio-on.svg'

/**
 * 공개 범위 선택 카드 하나("전체 공개", "비공개"). 하나만 고를 수 있어서 라디오 버튼으로 만들었다.
 * 선택된 카드는 오른쪽 동그라미가 채워진다.
 *
 * @param {{
 *   value: string,
 *   checked: boolean,
 *   onChange: (value: string) => void,
 *   title: string,
 *   description: string,
 *   iconUrl: string,
 * }} props
 * - `value`: 이 카드가 나타내는 공개 범위 값
 * - `checked`: 선택되어 있는지
 * - `onChange`: 선택하면 `value`와 함께 호출한다
 * - `iconUrl`: 왼쪽 자물쇠 그림
 */
export const VisibilityOption = ({ value, checked, onChange, title, description, iconUrl }) => (
  <label className="relative block h-17.25 cursor-pointer">
    <input
      type="radio"
      name="visibility"
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="peer sr-only"
    />
    <span className="absolute inset-0 rounded-[5px] bg-sky peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
    <img
      src={iconUrl}
      alt=""
      width={27}
      height={27}
      className="pointer-events-none absolute top-4.5 left-2"
    />
    <span className="pointer-events-none absolute top-3.75 left-11.5 text-base leading-[normal] font-semibold text-ink">
      {title}
    </span>
    <span className="pointer-events-none absolute top-10 left-11.5 text-xs leading-[normal] text-ink">
      {description}
    </span>
    <img
      src={radioOffUrl}
      alt=""
      width={22}
      height={22}
      className="pointer-events-none absolute top-[23.5px] right-6.5 peer-checked:hidden"
    />
    <img
      src={radioOnUrl}
      alt=""
      width={22}
      height={22}
      className="pointer-events-none absolute top-[23.5px] right-6.5 hidden peer-checked:block"
    />
  </label>
)
