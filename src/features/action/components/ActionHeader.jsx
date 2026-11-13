import { Link } from 'react-router-dom'
// 동료가 옮겨 둔 공용 아이콘이다(Figma 렌더 비교 차이 0). 복사하지 않고 그대로 가져다 쓴다.
import backUrl from '@/assets/back.svg'
import homeIconUrl from '@/assets/home-icon.svg'

/**
 * 행동 제안 화면 상단 헤더 (Figma y 44~110 구간). 이 화면은 제목과 별 장식이 없다.
 * 아이콘 중심이 Figma 위치(뒤로 (25, 72.5), 홈 (367.5, 74.5))에 오도록 44px 이상 클릭 영역 가운데에 아이콘을 둔다.
 * TODO(공통화 검토): 감정 변화·종결 화면 헤더와 구조가 같다. 공용 헤더로 뺄지 동료와 정한다.
 *
 * @param {object} props
 * @param {() => void} props.onBack 뒤로 가기 핸들러
 * @param {string} props.homeTo 홈 아이콘이 이동할 주소
 */
export const ActionHeader = ({ onBack, homeTo }) => (
  <header className="relative h-16.5 shrink-0">
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로 가기"
      className="absolute top-1.5 left-0.75 flex h-11.25 w-11 items-center justify-center"
    >
      {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
      <img src={backUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
    </button>
    <Link
      to={homeTo}
      aria-label="홈으로 가기"
      className="absolute top-2 left-86.25 flex size-11.25 items-center justify-center"
    >
      <img src={homeIconUrl} alt="" width={17} height={19} />
    </Link>
  </header>
)
