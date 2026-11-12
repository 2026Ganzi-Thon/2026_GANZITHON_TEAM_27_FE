import { getCardTone } from '../utils'
import { RecentCaseCard } from './RecentCaseCard'

/**
 * "최근 사건파일" 제목과 최근 사건 카드 목록. 불러오는 중, 오류, 빈 목록도 보여준다.
 *
 * @param {{
 *   cases: Array<{ id: string, title: string, dateLabel: string, emotionChange: string }>,
 *   isLoading?: boolean,
 *   isError?: boolean,
 *   className?: string,
 * }} props
 * - `isLoading`: 목록을 불러오는 중인지
 * - `isError`: 목록을 불러오지 못했는지
 * - `className`: 위쪽 간격처럼 화면마다 다른 여백을 덧붙인다.
 */
export const RecentCaseList = ({
  cases,
  isLoading = false,
  isError = false,
  className = 'mt-9.75',
}) => (
  <section aria-labelledby="recent-cases-title" className={className}>
    <h2 id="recent-cases-title" className="mb-3 pl-5.25 text-base font-semibold text-ink">
      최근 사건파일
    </h2>
    {isLoading ? (
      <p role="status" className="mx-4 py-10 text-center text-xs text-ink">
        불러오는 중…
      </p>
    ) : isError ? (
      <p role="alert" className="mx-4 py-10 text-center text-xs text-danger">
        사건파일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    ) : cases.length === 0 ? (
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
