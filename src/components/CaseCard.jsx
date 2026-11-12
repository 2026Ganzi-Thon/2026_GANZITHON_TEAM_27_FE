import chevronUrl from '@/assets/chevron-right.svg'

/** 카드 배경색. 시안(Figma)의 회색 / 하늘색 / 진회색 세 가지다. */
const TONE_CLASSES = {
  gray: 'bg-field',
  sky: 'bg-sky',
  slate: 'bg-card-gray',
}

/**
 * 사건 카드 하나. 날짜, 제목, 감정 변화를 보여준다. 홈의 최근 사건과 사건 목록에서 함께 쓴다.
 *
 * @param {{
 *   title: string,
 *   dateLabel: string,
 *   emotionChange: string,
 *   tone?: 'gray' | 'sky' | 'slate',
 *   onClick?: () => void,
 * }} props
 * - `tone`: 배경색. 기본은 회색이다.
 * TODO(API 확인 필요): 진행 중이거나 감정 비교가 불가능한 사건은 `emotionChange`가 없을 수 있다. 응답 필드가 확정되면 상태별 표시를 나눈다.
 * TODO(API 확인 필요): 사건 상세 이동은 라우트와 응답 필드가 확정되면 연결한다.
 */
export const CaseCard = ({ title, dateLabel, emotionChange, tone = 'gray', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${title}, ${dateLabel}, 감정 변화 ${emotionChange}`}
    className={`relative block h-31.75 w-full rounded-[15px] text-left text-ink ${TONE_CLASSES[tone]}`}
  >
    <span className="absolute top-4.75 left-5.5 flex h-7.25 w-28.5 items-center justify-center rounded-full bg-ink pt-0.5 text-xs text-field">
      {dateLabel}
    </span>
    <span className="absolute top-15.25 left-6.75 text-base font-semibold">{title}</span>
    <span className="absolute top-22.5 left-6.25 text-base font-semibold">감정 변화</span>
    <span className="absolute top-23.25 left-22.75 text-xs">{emotionChange}</span>
    <img
      src={chevronUrl}
      alt=""
      width={17}
      height={9}
      className="absolute top-11.5 right-4 -rotate-90"
    />
  </button>
)
