import faceUrl from '@/assets/intake/intensity-face.svg'
import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'

/** 슬라이더 손잡이(원) 모양. 브라우저마다 접두사가 달라 같은 값을 두 번 쓴다. */
const THUMB =
  '[&::-webkit-slider-thumb]:size-5.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:size-5.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-white'

/**
 * 감정 강도(0~100) 슬라이더. 왼쪽에 표정 그림, 오른쪽에 현재 숫자를 보여준다.
 *
 * @param {{ value: number, onChange: (value: number) => void }} props
 * - `value`: 현재 강도
 * - `onChange`: 슬라이더를 움직이면 새 강도(숫자)와 함께 호출한다
 */
export const IntensitySlider = ({ value, onChange }) => {
  const { min, max } = EMOTION_INTENSITY_RANGE
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="mt-4.75 flex items-start gap-5.5">
      <img src={faceUrl} alt="" width={43} height={43} className="shrink-0" aria-hidden="true" />
      <div className="w-58.5 shrink-0">
        <div className="relative h-5.5">
          <div
            className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.25)]"
            aria-hidden="true"
          >
            <div className="h-full bg-sky" style={{ width: `${percent}%` }} />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label="감정의 강도"
            aria-valuetext={`${value}`}
            className={`absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent ${THUMB}`}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-ink" aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <output aria-hidden="true" className="w-10 shrink-0 text-3xl font-bold text-ink">
        {value}
      </output>
    </div>
  )
}
