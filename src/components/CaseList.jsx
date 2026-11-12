import { CaseCard } from './CaseCard'

/** 목록에서 카드 색을 돌리는 순서. 시안 순서(회색 → 하늘색 → 진회색)대로 반복한다. */
const TONE_ORDER = ['gray', 'sky', 'slate']

/**
 * "최근 사건파일" 제목과 사건 카드 목록. 홈과 사건 목록 화면에서 함께 쓴다.
 * 카드 색은 목록 순서대로 돌려서 정한다. 불러오는 중, 오류, 빈 목록도 보여준다.
 *
 * @param {{
 *   cases: Array<{ id: string, title: string, dateLabel: string, emotionChange: string }>,
 *   title?: string,
 *   isLoading?: boolean,
 *   isError?: boolean,
 *   className?: string,
 *   onSelectCase?: (id: string) => void,
 * }} props
 * - `title`: 목록 제목. 기본은 "최근 사건파일"이다.
 * - `isLoading`: 목록을 불러오는 중인지
 * - `isError`: 목록을 불러오지 못했는지
 * - `className`: 위쪽 간격처럼 화면마다 다른 여백을 덧붙인다.
 * - `onSelectCase`: 카드를 눌렀을 때 사건 id와 함께 호출한다.
 */
export const CaseList = ({
  cases,
  title = '최근 사건파일',
  isLoading = false,
  isError = false,
  className = 'mt-9.75',
  onSelectCase,
}) => (
  <section aria-labelledby="case-list-title" className={className}>
    <h2 id="case-list-title" className="mb-3 pl-5.25 text-base font-semibold text-ink">
      {title}
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
            <CaseCard
              title={item.title}
              dateLabel={item.dateLabel}
              emotionChange={item.emotionChange}
              tone={TONE_ORDER[index % TONE_ORDER.length]}
              onClick={onSelectCase ? () => onSelectCase(item.id) : undefined}
            />
          </li>
        ))}
      </ul>
    )}
  </section>
)
