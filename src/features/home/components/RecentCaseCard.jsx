import chevronUrl from '@/assets/home/chevron-right.svg'

/**
 * 최근 사건 카드 하나. 날짜, 제목, 감정 변화를 보여준다.
 *
 * @param {{ title: string, dateLabel: string, emotionChange: string, toneClass: string, onClick?: () => void }} props
 * TODO(API 확인 필요): 사건 상세 이동은 라우트와 응답 필드가 확정되면 연결한다.
 */
export const RecentCaseCard = ({ title, dateLabel, emotionChange, toneClass, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${title}, ${dateLabel}, 감정 변화 ${emotionChange}`}
    className={`relative block h-31.75 w-full rounded-[15px] text-left text-ink ${toneClass}`}
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
