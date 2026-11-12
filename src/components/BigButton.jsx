import { Link } from 'react-router-dom'

const BASE =
  'flex h-button w-full shrink-0 items-center justify-center rounded-[41px] bg-ink text-base font-semibold text-white disabled:opacity-40'

/**
 * 화면 아래의 큰 검은 알약 버튼("게시하기", "확인" 등).
 * `to`를 주면 페이지 이동용 `Link`, 아니면 실행용 `button`으로 그린다.
 *
 * @param {{
 *   to?: string,
 *   type?: 'button' | 'submit',
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   className?: string,
 *   children: import('react').ReactNode,
 * }} props
 * - `to`: 이동할 주소. 있으면 `Link`로 그린다
 * - `type`: `button`일 때의 종류. 기본은 `button`
 * - `className`: 위아래 간격처럼 화면마다 다른 여백을 덧붙인다
 */
export const BigButton = ({
  to,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
}) =>
  to ? (
    <Link to={to} className={`${BASE} ${className}`}>
      {children}
    </Link>
  ) : (
    <button type={type} disabled={disabled} onClick={onClick} className={`${BASE} ${className}`}>
      {children}
    </button>
  )
