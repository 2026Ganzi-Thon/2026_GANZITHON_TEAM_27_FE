import { Link } from 'react-router-dom'

/**
 * 종결 화면의 하늘색 이동 카드 (Figma 370×77, r5).
 * 아이콘·제목·설명 위치는 카드 왼쪽 위 기준 Figma 좌표를 그대로 쓴다.
 * 제목(x 77, y 17)과 설명(x 77, y 47)은 두 카드가 같고, 아이콘 크기·위치는 카드마다 다르다.
 *
 * @param {object} props
 * @param {string} props.to 이동할 주소
 * @param {string} props.title 카드 제목 (예: '사건파일 요약')
 * @param {string} props.description 카드 설명
 * @param {string} props.iconSrc 아이콘 이미지 주소
 * @param {{width: number, height: number, className: string}} props.icon 아이콘 크기와 위치 클래스
 * @param {string} [props.className] 카드 바깥 여백 클래스
 */
export const ClosingCard = ({ to, title, description, iconSrc, icon, className = '' }) => (
  <Link
    to={to}
    className={`relative ml-4.25 block h-19.25 w-92.5 shrink-0 rounded-field bg-sky text-ink ${className}`}
  >
    <img
      src={iconSrc}
      alt=""
      width={icon.width}
      height={icon.height}
      className={`absolute max-w-none ${icon.className}`}
    />
    <span className="absolute top-4.25 left-19.25 text-xl leading-[normal] font-semibold whitespace-nowrap">
      {title}
    </span>
    {/* 스크린 리더가 제목과 설명을 붙여 읽지 않도록 사이에 공백을 둔다(화면 배치에는 영향 없음). */}{' '}
    <span className="absolute top-11.75 left-19.25 text-xs leading-[normal] whitespace-nowrap">
      {description}
    </span>
  </Link>
)
