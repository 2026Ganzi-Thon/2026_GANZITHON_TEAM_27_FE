import { getCardTone } from '../utils'
import { RecentCaseCard } from './RecentCaseCard'

/**
 * "최근 사건파일" 제목과 최근 사건 카드 목록.
 *
 * @param {{ cases: Array<{ id: string, title: string, dateLabel: string, emotionChange: string }>, className?: string }} props
 * - `className`: 위쪽 간격처럼 화면마다 다른 여백을 덧붙인다.
 */
export const RecentCaseList = ({ cases, className = 'mt-9.75' }) => (
  <section aria-labelledby="recent-cases-title" className={className}>
    <h2 id="recent-cases-title" className="mb-3 pl-5.25 text-base font-semibold text-ink">
      최근 사건파일
    </h2>
    {cases.length === 0 ? (
      <p className="mx-4 rounded-[15px] bg-field py-10 text-center text-xs text-ink">
        아직 접수한 사건이 없어요.
      </p>
    ) : (
      <ul className="mx-4">
        {cases.map((item, index) => (
          <li key={item.id}>
            <RecentCaseCard {...item} toneClass={getCardTone(index)} />
          </li>
        ))}
      </ul>
    )}
  </section>
)
