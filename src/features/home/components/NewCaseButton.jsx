/**
 * 새 사건 접수를 시작하는 큰 버튼.
 *
 * @param {{ label?: string, className?: string, onClick?: () => void }} props
 * - `label`: 버튼 글자. 신규 홈은 "사건 접수하기", 재방문 홈은 "새 사건 접수하기"를 쓴다.
 * - `className`: 위아래 간격처럼 화면마다 다른 여백을 덧붙인다.
 * TODO(피그마 확인 필요): 사건 접수 화면 라우트가 확정되면 `Link`로 바꾼다.
 */
export const NewCaseButton = ({ label = '사건 접수하기', className = '', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative mx-4 h-button shrink-0 rounded-[41px] bg-ink text-base font-semibold text-field ${className}`}
  >
    {label}
  </button>
)
