import { Link } from 'react-router-dom'

/**
 * 새 사건 접수 화면으로 가는 큰 버튼. 페이지 이동이라 `Link`를 쓴다.
 *
 * @param {{ to: string, label?: string, className?: string }} props
 * - `to`: 사건 접수 화면 주소
 * - `label`: 버튼 글자. 신규는 "사건 접수하기", 진행 중인 사건이 있으면 "새 사건 접수하기"를 쓴다.
 * - `className`: 위아래 간격처럼 화면마다 다른 여백을 덧붙인다.
 */
export const NewCaseButton = ({ to, label = '사건 접수하기', className = '' }) => (
  <Link
    to={to}
    className={`relative mx-4 flex h-button shrink-0 items-center justify-center rounded-[41px] bg-ink text-base font-semibold text-field ${className}`}
  >
    {label}
  </Link>
)
