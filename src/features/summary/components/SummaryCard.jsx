/** 카드 색 (Figma: 처음 든 생각 = 회색, 최종판결 = 진회색, 사건 유형 = 회청색) */
const TONES = {
  gray: 'bg-field text-ink',
  ink: 'bg-ink text-field',
  slate: 'bg-card-gray text-ink',
}

/**
 * 사건요약 카드 (Figma 367×74, r5). 제목과 내용을 보여준다.
 * 글자 위치는 카드 왼쪽 위 기준 Figma 좌표 그대로다: 제목 (20, 17.86), 내용 (20, 39.13, 14px·줄 높이 19.6px).
 *
 * 흐름 배치: 카드는 화면 폭에 맞춰 늘고 줄며(왼쪽 17px·오른쪽 18px, 402px 화면에서 Figma와 같은 367px),
 * 안의 제목·내용은 위에서부터 차례로 놓인다. 내용이 여러 줄이 되면 카드 높이가 늘고 아래 요소가 밀려난다.
 * 한 줄일 때는 Figma처럼 높이 74px이다(위 여백 17.86 + 제목 줄 + 간격 + 내용 줄 19.6 + 아래 여백 14.27).
 *
 * @param {object} props
 * @param {string} props.title 카드 제목
 * @param {import('react').ReactNode} props.children 카드 내용 (`SummaryCardLine` 등)
 * @param {'gray' | 'ink' | 'slate'} props.tone 카드 색
 * @param {string} [props.className] 바깥 여백 클래스
 */
export const SummaryCard = ({ title, children, tone, className = '' }) => (
  <section
    className={`relative mr-4.5 ml-4.25 min-h-18.5 shrink-0 rounded-field px-5 pt-[17.86px] pb-[14.27px] ${TONES[tone]} ${className}`}
  >
    <h2 className="text-base leading-[normal] font-semibold">{title}</h2>
    {children}
  </section>
)

/**
 * 사건요약 카드의 내용 한 줄. 넘치면 말줄임한다.
 * Figma 내용 상자는 y 39.13이지만 상자 높이(17.01)가 줄 높이(19.6)보다 작게 줄어 있어,
 * Figma 화면의 글자는 줄 높이 기준 위치보다 1px 아래에 그려진다. 내보낸 frame.png와 맞추려고 카드 위에서 40.13에 둔다.
 * TODO(피그마 확인 필요): 내용이 길어 카드를 넘칠 때의 디자인이 없다. 지금은 한 줄로 두고 넘치면 말줄임한다.
 *
 * @param {object} props
 * @param {string} props.content 내용
 */
export const SummaryCardLine = ({ content }) => (
  <p className="mt-[3.18px] truncate text-sm leading-[19.6px]">{content || '—'}</p>
)
