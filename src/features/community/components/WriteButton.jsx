import { Link } from 'react-router-dom'
import circleUrl from '@/assets/community/fab-circle.svg'
import pencilUrl from '@/assets/community/icon-pencil.svg'

/**
 * @param {{to: string}} props 글쓰기 화면 주소
 * 게시판 화면 오른쪽 아래, 하단 탭바 바로 위(시안 위치)에 고정된 둥근 글쓰기 버튼. `sticky`로 붙는다(`fixed`를 쓰지 않는다).
 * 내용이 짧아도 길어도 같은 자리에 있도록, 쓰는 화면은 하단 탭바 바로 뒤(화면 맨 끝)에 이 버튼을 둔다.
 *
 */
export const WriteButton = ({ to }) => (
  <div className="pointer-events-none sticky bottom-23.5 z-10 h-0 shrink-0">
    <Link
      to={to}
      aria-label="글쓰기"
      className="pointer-events-auto absolute right-3.25 bottom-0 flex h-14 w-14.25 items-center justify-center"
    >
      <img src={circleUrl} alt="" width={57} height={56} className="absolute inset-0" />
      <img src={pencilUrl} alt="" width={24} height={24} className="relative" />
    </Link>
  </div>
)
