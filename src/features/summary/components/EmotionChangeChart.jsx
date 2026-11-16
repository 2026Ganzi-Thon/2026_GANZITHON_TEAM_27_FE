import { intensityToChartY, SUMMARY_EMOTION_SECTION } from '../utils'

/** 이 영역의 기준 y (Figma 화면 좌표). 안쪽 요소는 모두 Figma 좌표에서 이 값을 빼서 놓는다. */
const TOP = 464

/** 점 지름 */
const DOT = 17

/**
 * 그래프 그림 영역의 가로 기준 (Figma 402px 화면). 축은 x 60에서 시작해 화면 오른쪽 17px 앞(x 385)에서 끝난다.
 * 화면 폭이 달라지면 이 영역만 늘고 줄며, 점의 가로 위치는 영역 안에서의 비율을 지킨다(402px에서 Figma와 같다).
 */
const PLOT_LEFT = 60
const PLOT_RIGHT_GAP = 17
const PLOT_WIDTH_AT_402 = 325
/** 점 중심 x의 영역 안 비율 (Figma 96.5 → 36.5/325, 360.5 → 300.5/325) */
const BEFORE_RATIO = (96.5 - PLOT_LEFT) / PLOT_WIDTH_AT_402
const AFTER_RATIO = (360.5 - PLOT_LEFT) / PLOT_WIDTH_AT_402
/** 축 위쪽 y (Figma 526) */
const AXIS_TOP = 526

/**
 * 영역 안 비율 위치를 CSS left 값으로 바꾼다. (예: 비율 0.5, 보정 -8.5px → 영역 가운데에서 8.5px 왼쪽)
 * @param {number} ratio 영역 안 가로 비율 (0~1)
 * @param {number} [offset] 더할 px
 * @returns {string}
 */
const plotLeft = (ratio, offset = 0) =>
  `calc(${PLOT_LEFT}px + (100% - ${PLOT_LEFT + PLOT_RIGHT_GAP}px) * ${ratio} + ${offset}px)`

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

            {/* 축과 두 점을 잇는 선 (점 아래에 그린다). 그림 영역(x 60 ~ 오른쪽 17px 앞)만 화면 폭에 맞춰 늘고 준다.
                Figma 축(Vector 547): 세로 145px·가로 325px(402px 화면)·두께 1px의 L자, 선 두께의 가운데가 좌표선 위에 놓인다. */}
            <svg
              className="absolute overflow-visible fill-ink stroke-ink"
              style={{
                top: at(AXIS_TOP),
                left: PLOT_LEFT,
                width: `calc(100% - ${PLOT_LEFT + PLOT_RIGHT_GAP}px)`,
                height: 146,
              }}
              aria-hidden="true"
            >
              <rect x="-0.5" y="0" width="1" height="145.5" stroke="none" />
              <rect x="0" y="144.5" width="100%" height="1" stroke="none" />
              <line
                x1={`${BEFORE_RATIO * 100}%`}
                y1={at(intensityToChartY(emotion.before)) - at(AXIS_TOP)}
                x2={`${AFTER_RATIO * 100}%`}
                y2={at(intensityToChartY(emotion.after)) - at(AXIS_TOP)}
                strokeWidth="1"
              />
            </svg>

            <ChartPoint
              ratio={BEFORE_RATIO}
              cy={at(intensityToChartY(emotion.before))}
              value={emotion.before}
              labelOffsetY={30.5}
              labelOffsetX={-14.5}
              className="bg-field"
            />
            <ChartPoint
              ratio={AFTER_RATIO}
              cy={at(intensityToChartY(emotion.after))}
              value={emotion.after}
              labelOffsetY={34.5}
              labelOffsetX={-14.5}
              className="bg-sky"
            />
          </figure>

          {/* Figma 요약 문장: (18, 695). 좁은 화면에서는 줄을 바꿔 가로로 넘치지 않는다. */}
          <p className="absolute top-57.75 right-4.5 left-4.5 text-sm leading-[normal]">
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
 * 그래프 점과 값 글자. 그림 영역 안 가로 비율(ratio)과 점 중심 y(cy)를 받아 지름 17px 원과 "NN%" 글자를 그린다.
 * @param {{ ratio: number, cy: number, value: number, labelOffsetX: number, labelOffsetY: number, className: string }} props
 */
const ChartPoint = ({ ratio, cy, value, labelOffsetX, labelOffsetY, className }) => (
  <>
    <span
      className={`absolute rounded-full ${className}`}
      style={{ left: plotLeft(ratio, -DOT / 2), top: cy - DOT / 2, width: DOT, height: DOT }}
      aria-hidden="true"
    />
    <span
      className="absolute text-sm leading-[normal]"
      style={{ left: plotLeft(ratio, labelOffsetX), top: cy - labelOffsetY }}
      aria-hidden="true"
    >
      {value}%
    </span>
  </>
)
