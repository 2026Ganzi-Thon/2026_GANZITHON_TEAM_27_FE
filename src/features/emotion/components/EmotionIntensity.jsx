// 사건 접수 화면(동료)의 표정 그림과 같은 에셋이다. 복사·수정하지 않고 원본 SVG 글자를 그대로 가져다 쓴다.
// 작은 사각형 수백 개로 된 픽셀 그림이라 <img>로 그리면 사각형 사이에 격자 이음선이 보인다.
// 화면에 직접 넣고 shape-rendering: crispEdges를 주면 이음선이 사라진다(얼굴 영역 다른 픽셀 419 → 129).
import faceSvg from '@/assets/intake/intensity-face.svg?raw'
import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'
import { IntensitySlider } from './IntensitySlider'

/**
 * "접수 당시: 70" 자리에 보여줄 문구. 불러오는 중·실패·기록 없음도 같은 자리에서 처리한다.
 * TODO(피그마 확인 필요): 불러오는 중·실패·접수 때 감정 미입력 상태 디자인이 없어 같은 글자 모양으로 문구만 바꾼다.
 */
const IntakeIntensityLabel = ({ intake }) => {
  if (intake.status === 'loading') return <span role="status">접수 당시: …</span>
  if (intake.status === 'error') {
    return (
      <span role="alert">
        접수 당시: 불러오지 못했어요{' '}
        <button type="button" onClick={intake.onRetry} className="underline">
          다시 시도
        </button>
      </span>
    )
  }
  if (intake.intensity == null) return <span>접수 당시: 기록 없음</span>
  return <span>접수 당시: {intake.intensity}</span>
}

/**
 * 감정 강도 영역 (Figma y 272~363). 제목과 접수 당시 강도, 표정 그림, 강도 슬라이더, 현재 숫자를 보여준다.
 * Figma 좌표를 그대로 쓰려고 화면 왼쪽(x 0) 기준으로 절대 위치를 잡는다.
 *
 * TODO(피그마 확인 필요): 값에 따라 표정·색·문구가 바뀌는 디자인이 없어 표정 그림은 하나로 고정한다.
 *
 * @param {object} props
 * @param {number} props.value 지금 감정 강도 (0~100)
 * @param {(value: number) => void} props.onChange 강도 변경 핸들러
 * @param {{status: 'loading' | 'error' | 'ready', intensity?: number | null, onRetry?: () => void}} props.intake
 *   접수 당시 강도 상태
 */
export const EmotionIntensity = ({ value, onChange, intake }) => {
  const { min, max } = EMOTION_INTENSITY_RANGE

  return (
    <section className="text-ink">
      {/* Figma 제목 "감정 강도": x 15, y 272 / "접수 당시": x 84, y 275 */}
      <div className="relative mt-28.75 h-4.75">
        <h2 className="absolute top-0 left-3.75 text-base leading-[normal] font-semibold">
          감정 강도
        </h2>
        <p className="absolute top-0.75 left-21 text-xs leading-[normal] whitespace-nowrap">
          <IntakeIntensityLabel intake={intake} />
        </p>
      </div>

      {/* Figma 강도 줄: y 304~363 */}
      <div className="relative mt-3.25 h-14.75">
        {/* Figma 표정: x 18, y 304, 43.21×43 */}
        {/* 저장소 안의 고정 SVG 파일이라 사용자 입력이 섞이지 않는다. */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-4.5 block [shape-rendering:crispEdges]"
          dangerouslySetInnerHTML={{ __html: faceSvg }}
        />

        {/* 슬라이더 요소: 바(x 87~321) 양쪽에 손잡이 반지름 11px을 더해 x 76부터, 바 중심 y 331이 가운데 */}
        <div className="absolute top-1.5 left-19">
          <IntensitySlider value={value} onChange={onChange} label="지금 감정의 강도" />
        </div>

        {/* Figma 눈금: "0" x 87, "100" x 301, y 349 */}
        <span className="absolute top-11.25 left-21.75 text-xs leading-[normal]" aria-hidden="true">
          {min}
        </span>
        <span className="absolute top-11.25 left-75.25 text-xs leading-[normal]" aria-hidden="true">
          {max}
        </span>

        {/* Figma 숫자: x 347, y 311, 30px Bold. 값은 슬라이더의 aria-valuenow로도 읽힌다.
            세 자리("100")는 왼쪽 기준이면 화면 끝에 붙으므로, Figma 숫자 상자 오른쪽 끝(x 387, 화면 끝에서 15px)에 맞춘다.
            TODO(피그마 확인 필요): 세 자리 숫자일 때의 디자인이 없어 오른쪽 맞춤으로 처리했다. */}
        <output
          aria-hidden="true"
          className={`absolute top-1.75 text-3xl leading-[normal] font-bold ${
            value >= 100 ? 'right-3.75' : 'left-86.75'
          }`}
        >
          {value}
        </output>
      </div>
    </section>
  )
}
