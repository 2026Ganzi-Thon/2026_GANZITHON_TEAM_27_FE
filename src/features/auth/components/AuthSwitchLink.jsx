import { Link } from 'react-router-dom'

/**
 * 화면 하단의 "계정이 없으신가요? 회원가입" 같은 화면 전환 링크.
 * @param {object} props
 * @param {string} props.question 앞에 붙는 안내 문구
 * @param {string} props.to 이동할 주소
 * @param {string} props.label 링크 글자
 */
export const AuthSwitchLink = ({ question, to, label }) => (
  <p className="flex items-baseline gap-1 text-xs text-ink">
    {question}
    <Link to={to} className="text-base font-semibold">
      {label}
    </Link>
  </p>
)
