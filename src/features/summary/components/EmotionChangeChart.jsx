import { intensityToChartY, SUMMARY_EMOTION_SECTION } from '../utils'

/** 이 영역의 기준 y (Figma 화면 좌표). 안쪽 요소는 모두 Figma 좌표에서 이 값을 빼서 놓는다. */
const TOP = 464

/** 점 지름과 가로 위치(Figma 점 중심 x) */
const DOT = 17
const BEFORE_X = 96.5
const AFTER_X = 360.5

/**
 * Figma 축(Vector 547)의 외곽선 그대로: (60, 526)에서 세로 145px, 가로 325px, 두께 1px의 L자.
 * 선 두께의 가운데가 좌표선 위에 놓인다.
 */
const AXIS_PATH =
  'M0 145L-0.5 145L-0.5 145.5L0 145.5L0 145ZM0 0L-0.5 0L-0.5 145L0 145L0.5 145L0.5 0L0 0ZM0 145L0 145.5L325 145.5L325 145L325 144.5L0 144.5L0 145Z'

/**
 * 감정 변화 확인 영역 (Figma y 464~712). 범례, 재판 전·후 감정 강도 그래프, 요약 문장을 보여준다.
 *
 * - 점 위치는 눈금(100·50·0) 기준으로 값에 비례한다. Figma의 점은 이 눈금과 맞지 않아
 *   목업 값(80·40)에서 Figma보다 1.3px·5.1px 아래에 놓인다. (디자이너 확인 필요)
 * - 값 글자("80%", "40%")는 Figma에서 각 점에 붙은 위치(점 중심 기준 위 30.5px / 34.5px)를 그대로 따라간다.
 *
 * @param {object} props
 * @param {{ label: string, before: number, after: number, sentence: string } | null} props.emotion
 *   비교할 감정. null이면 비교할 수 없다는 문구만 보여준다.
 * @param {import('react').Ref<HTMLElement>} [props.ref] 그래프 영역으로 스크롤·포커스를 옮길 때 쓰는 ref
 */
export const EmotionChangeChart = ({ emotion, ref }) => {
  const at = (y) => y - TOP

  return (
    <section
      ref={ref}
      id={SUMMARY_EMOTION_SECTION}
      tabIndex={-1}
      aria-labelledby="emotion-change-title"
      className="relative mt-10 h-62 shrink-0 text-ink"
    >
      <h2
        id="emotion-change-title"
        className="absolute top-0 left-4.5 text-base leading-[normal] font-semibold"
      >
        감정변화 확인
      </h2>

      {emotion ? (
        <>
          {/* 범례: Figma 점 (126, 465)·(213, 465), 글자 (152, 467)·(239, 467) */}
          <span
            className="absolute top-px left-31.5 size-4.25 rounded-full bg-field"
            aria-hidden="true"
          />
          <span className="absolute top-0.75 left-38 text-xs leading-[normal]">재판 전</span>
          <span
            className="absolute top-px left-53.25 size-4.25 rounded-full bg-sky"
            aria-hidden="true"
          />
          <span className="absolute top-0.75 left-59.75 text-xs leading-[normal]">재판 후</span>

          <figure className="absolute inset-0 m-0">
            <figcaption className="sr-only">
              {`재판 전 ${emotion.label} ${emotion.before}%, 재판 후 ${emotion.after}%`}
            </figcaption>
            {/* 눈금 글자: Figma "100" (24, 526), "50" (26, 593), "0" (30, 660) */}
            <span className="absolute top-15.5 left-6 text-xs leading-[normal]" aria-hidden="true">
              100
            </span>
            <span
              className="absolute top-32.25 left-6.5 text-xs leading-[normal]"
              aria-hidden="true"
            >
              50
            </span>
            <span className="absolute top-49 left-7.5 text-xs leading-[normal]" aria-hidden="true">
              0
            </span>

            {/* 축과 두 점을 잇는 선 (점 아래에 그린다) */}
            <svg
              className="absolute top-0 left-0 overflow-visible"
              width="402"
              height="248"
              aria-hidden="true"
            >
              <path transform={`translate(60 ${at(526)})`} d={AXIS_PATH} fill="#2f2f2f" />
              <line
                x1={BEFORE_X}
                y1={at(intensityToChartY(emotion.before))}
                x2={AFTER_X}
                y2={at(intensityToChartY(emotion.after))}
                stroke="#2f2f2f"
                strokeWidth="1"
              />
            </svg>

            <ChartPoint
              cx={BEFORE_X}
              cy={at(intensityToChartY(emotion.before))}
              value={emotion.before}
              labelOffsetY={30.5}
              labelOffsetX={-14.5}
              className="bg-field"
            />
            <ChartPoint
              cx={AFTER_X}
              cy={at(intensityToChartY(emotion.after))}
              value={emotion.after}
              labelOffsetY={34.5}
              labelOffsetX={-14.5}
              className="bg-sky"
            />
          </figure>

          {/* Figma 요약 문장: (18, 695) */}
          <p className="absolute top-57.75 left-4.5 text-sm leading-[normal] whitespace-nowrap">
            {emotion.sentence}
          </p>
        </>
      ) : (
        // TODO(피그마 확인 필요): 접수·종결 감정이 다르거나 기록이 없어 비교할 수 없을 때의 디자인이 없다.
        <p className="absolute top-10 left-4.5 text-sm leading-[normal]">
          재판 전과 후의 감정을 비교할 수 없어요.
        </p>
      )}
    </section>
  )
}

/**
 * 그래프 점과 값 글자. 점 중심 좌표(cx, cy)를 받아 지름 17px 원과 "NN%" 글자를 그린다.
 * @param {{ cx: number, cy: number, value: number, labelOffsetX: number, labelOffsetY: number, className: string }} props
 */
const ChartPoint = ({ cx, cy, value, labelOffsetX, labelOffsetY, className }) => (
  <>
    <span
      className={`absolute rounded-full ${className}`}
      style={{ left: cx - DOT / 2, top: cy - DOT / 2, width: DOT, height: DOT }}
      aria-hidden="true"
    />
    <span
      className="absolute text-sm leading-[normal]"
      style={{ left: cx + labelOffsetX, top: cy - labelOffsetY }}
      aria-hidden="true"
    >
      {value}%
    </span>
  </>
)
