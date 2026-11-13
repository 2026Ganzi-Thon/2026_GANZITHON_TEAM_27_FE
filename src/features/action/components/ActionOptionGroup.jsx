import { ActionOption } from './ActionOption'

/**
 * "CHOOSE YOUR ACTION" 제목과 2×2 행동 카드 묶음.
 * Figma 카드는 1~2px씩 어긋나 있지만 카드 1(181×77) 기준의 같은 격자로 맞춘다(디자이너 전달 목록에 넣음).
 * 열 간격 8px(카드 1·2), 행 간격 9px(카드 1·3·4).
 *
 * @param {object} props
 * @param {Array<{ id: string, title: string, description: string, tag: string }>} props.options 카드 목록
 * @param {string | null} props.value 선택된 카드 id
 * @param {(id: string) => void} props.onChange 카드를 고르면 호출한다
 * @param {boolean} [props.disabled] 저장 중에는 바꿀 수 없다
 */
export const ActionOptionGroup = ({ options, value, onChange, disabled = false }) => (
  <fieldset className="mx-4">
    <legend className="-ml-[0.17px] text-base leading-[normal] font-semibold text-ink">
      CHOOSE YOUR ACTION
    </legend>
    <div className="mt-[16.27px] grid grid-cols-2 gap-x-2 gap-y-2.25">
      {options.map((option) => (
        <ActionOption
          key={option.id}
          name="action-option"
          option={option}
          checked={value === option.id}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  </fieldset>
)
