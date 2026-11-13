import { Link } from 'react-router-dom'

const BUTTON_CLASS =
  'relative block h-button w-[calc((100%-7.14px)/2)] shrink-0 rounded-full bg-ink text-base leading-[normal] font-semibold text-canvas'

/**
 * 하단 버튼 두 개 (Figma y 768, 각 180.86×68, r41). 화면 맨 아래에서 38px 위에 놓인다.
 * 글자 위 y는 Figma 그대로 "확인" 794, "사건카드 만들기" 793이다(버튼 위에서 26px·25px).
 *
 * @param {object} props
 * @param {string} props.confirmTo "확인" 이동 주소
 * @param {string} props.makeCardTo "사건카드 만들기" 이동 주소
 */
export const SummaryActions = ({ confirmTo, makeCardTo }) => (
  // 두 버튼은 같은 너비로 화면 폭에 맞춰 늘고 준다(402px 화면에서 Figma와 같은 180.86px, 왼쪽 18px·오른쪽 15.14px).
  <div className="mt-auto flex gap-[7.14px] pt-6 pr-[15.14px] pb-9.5 pl-4.5">
    <Link to={confirmTo} className={BUTTON_CLASS}>
      <span className="absolute inset-x-0 top-6.5 text-center">확인</span>
    </Link>
    <Link to={makeCardTo} className={BUTTON_CLASS}>
      <span className="absolute inset-x-0 top-6.25 text-center">사건카드 만들기</span>
    </Link>
  </div>
)
