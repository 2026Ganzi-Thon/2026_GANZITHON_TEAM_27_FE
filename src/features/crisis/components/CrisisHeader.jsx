import { Link } from 'react-router-dom'
// 사건 접수 화면(동료)의 아이콘과 같은 에셋이다. 복사하지 않고 그대로 가져다 쓴다.
import backUrl from '@/assets/intake/back.svg'
import homeIconUrl from '@/assets/intake/home-icon.svg'

/**
 * 위기 안내 화면 상단 (Figma y 44~110 구간). 제목·별 장식 없이 뒤로가기와 홈 아이콘만 있다.
 * 아이콘 버튼은 아이콘 중심이 Figma 위치와 같도록 45×45 클릭 영역의 가운데에 아이콘을 둔다.
 *
 * TODO(기획 확인 필요: 명세 "흐름 중단"과 "계속할게요" 버튼 충돌) 위기 안내 이후에는 법정 흐름으로 돌아가지 않도록,
 * 뒤로가기도 이전 화면이 아니라 홈으로 보낸다.
 *
 * @param {object} props
 * @param {string} props.backTo 뒤로가기 이동 주소
 * @param {string} props.homeTo 홈 이동 주소
 */
export const CrisisHeader = ({ backTo, homeTo }) => (
  <header className="relative h-16.5 shrink-0">
    {/* 아이콘 중심: Figma (25, 72.5) */}
    <Link
      to={backTo}
      aria-label="뒤로 가기"
      className="absolute top-1.5 left-0.75 flex h-11.25 w-11 items-center justify-center"
    >
      {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
      <img src={backUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
    </Link>

    {/* 아이콘 중심: Figma (367.5, 74.5) */}
    <Link
      to={homeTo}
      aria-label="홈으로 이동"
      className="absolute top-2 left-86.25 flex size-11.25 items-center justify-center"
    >
      <img src={homeIconUrl} alt="" width={17} height={19} />
    </Link>
  </header>
)
