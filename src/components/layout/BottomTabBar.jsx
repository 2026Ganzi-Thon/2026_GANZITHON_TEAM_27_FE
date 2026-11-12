import { Link } from 'react-router-dom'
import clipboardUrl from '@/assets/nav/nav-clipboard.svg'
import ellipseUrl from '@/assets/nav/nav-ellipse.svg'
import gavelBaseUrl from '@/assets/nav/nav-gavel-part.svg'
import homeIconUrl from '@/assets/nav/nav-home.svg'

/** 사건요약 탭 아이콘(법봉)의 회전된 검은 조각. 시안(Figma)의 좌표를 그대로 옮겼다. */
const GavelPiece = ({ boxClass, pieceClass }) => (
  <span className={`absolute flex items-center justify-center ${boxClass}`} aria-hidden="true">
    <span className={`block flex-none rotate-[-37.15deg] bg-black ${pieceClass}`} />
  </span>
)

/**
 * 하단 공통 탭바(홈, 게시판, 사건요약). 프레임 안에서 `sticky`로 아래에 붙는다.
 * 공통 코드는 routes에 의존할 수 없어서 이동 주소는 페이지가 `ROUTE_PATHS`로 넘긴다.
 * 현재는 홈이 선택된 모양만 디자인이 있어서 홈 선택 상태로 고정한다.
 * TODO(피그마 확인 필요): 게시판·사건요약 화면에서의 선택 상태(아이콘 색, 홈 탭 비선택 모양) 디자인이 나오면 `current` 값으로 분기한다.
 * TODO(피그마 확인 필요): 탭 이름과 아이콘 짝(클립보드=게시판, 법봉=사건요약)을 확인한다.
 *
 * @param {{ homePath: string, boardPath: string, summaryPath: string }} props
 */
export const BottomTabBar = ({ homePath, boardPath, summaryPath }) => (
  <nav
    aria-label="주요 메뉴"
    className="sticky bottom-5.75 z-10 mx-auto mt-auto flex h-18 w-69 shrink-0 items-center gap-3.5 rounded-[55px] bg-ink/20 pl-5"
  >
    <Link
      to={homePath}
      aria-current="page"
      className="flex h-11.75 w-28.75 items-center justify-center gap-2.25 rounded-[23px] bg-black pr-0.5 text-base font-semibold text-sky"
    >
      <img src={homeIconUrl} alt="" width={23} height={25} />
      home
    </Link>
    <Link to={boardPath} aria-label="게시판" className="relative size-11.75 shrink-0">
      <img src={ellipseUrl} alt="" className="absolute inset-0 size-full" />
      <img
        src={clipboardUrl}
        alt=""
        width={22}
        height={28}
        className="absolute top-2.5 left-3.25"
      />
    </Link>
    <Link to={summaryPath} aria-label="사건요약" className="relative size-11.75 shrink-0">
      <img src={ellipseUrl} alt="" className="absolute inset-0 size-full" />
      <img
        src={gavelBaseUrl}
        alt=""
        width={19.29}
        height={6.48}
        className="absolute top-7.25 left-2.5"
      />
      <GavelPiece boxClass="top-1.75 left-3.5 h-3.75 w-3.75" pieceClass="h-2.5 w-3" />
      <GavelPiece boxClass="top-1 left-6 h-2.75 w-2.25" pieceClass="h-2.75 w-0.75 rounded-[31px]" />
      <GavelPiece
        boxClass="top-3.5 left-2.75 h-2.75 w-2.25"
        pieceClass="h-2.75 w-0.75 rounded-[31px]"
      />
      <GavelPiece boxClass="top-4.5 left-6 h-4.5 w-3.75" pieceClass="h-4.75 w-1 rounded-b-[31px]" />
    </Link>
  </nav>
)
