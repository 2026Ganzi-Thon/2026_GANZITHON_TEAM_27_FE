import { EMOTIONS } from '@/constants/emotions'

/**
 * 감정 선택 버튼 6개(3열 × 2행). 하나만 고를 수 있어서 라디오 버튼으로 만들었다.
 * 방향키로 옮길 수 있고, 선택된 버튼은 검은 배경으로 보인다.
 *
 * @param {{ value: string, onChange: (key: string) => void }} props
 * - `value`: 선택된 감정의 `key`
 * - `onChange`: 감정을 고르면 그 감정의 `key`와 함께 호출한다
 */
export const EmotionPicker = ({ value, onChange }) => (
  <fieldset className="mt-2.25">
    <legend className="sr-only">지금 어떤 감정인가요</legend>
    <div className="grid grid-cols-3 gap-x-1 gap-y-1.25">
      {EMOTIONS.map((emotion) => (
        <label key={emotion.key} className="relative block h-17.25 cursor-pointer">
          <input
            type="radio"
            name="emotion"
            value={emotion.key}
            checked={value === emotion.key}
            onChange={() => onChange(emotion.key)}
            className="peer sr-only"
          />
          <span className="flex size-full items-center justify-center rounded-[14px] border border-ink text-sm text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-checked:shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.25),inset_-2px_-1px_4.5px_0px_rgba(0,0,0,0.25)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
            {emotion.label}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
)
