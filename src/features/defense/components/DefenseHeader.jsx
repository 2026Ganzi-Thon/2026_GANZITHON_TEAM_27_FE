import { Link, useNavigate } from 'react-router-dom'
import backArrowUrl from '@/assets/defense/back-arrow.svg'
import headerStarsUrl from '@/assets/defense/header-stars.svg'
import homeIconUrl from '@/assets/defense/home-icon.svg'

/**
 * 변론 화면 상단 네비게이션 헤더 (Figma y 44~110 구간).
 * 별 장식과 제목은 Figma 좌표(x 63, x 187)를 왼쪽 기준으로 그대로 쓴다.
 * TODO(공통화 검토): 기소 화면 헤더와 구조가 같고 아이콘 색·홈 위치만 다르다. 디자인이 통일되면 공용 컴포넌트로 뺀다.
 *
 * @param {object} props
 * @param {string} [props.homeTo] 홈 이동 링크 주소 (기본값: '/')
 * @param {() => void} [props.onBack] 뒤로가기 핸들러. 없으면 브라우저 이전 기록으로 이동한다.
 */
export const DefenseHeader = ({ homeTo = '/', onBack }) => {
  const navigate = useNavigate()

  /** onBack이 있으면 실행하고, 없으면 이전 화면으로 돌아간다. */
  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    navigate(-1)
  }

  return (
    <header className="relative h-16.5 shrink-0 text-black">
      <img
        src={headerStarsUrl}
        alt=""
        width={277}
        height={15}
        className="absolute top-5.25 left-15.75 max-w-none select-none"
      />
      <h1 className="absolute top-5.25 left-46.75 text-base leading-auto font-semibold">변론</h1>

      {/* 아이콘 중심: Figma (25, 72.5) */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="뒤로 가기"
        className="absolute top-1.5 left-0.75 flex h-11.25 w-11 items-center justify-center"
      >
        {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
        <img src={backArrowUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
      </button>

      {/* 아이콘 중심: Figma (367.5, 74.5), 오른쪽 끝에서 17px */}
      <Link
        to={homeTo}
        aria-label="홈으로 이동"
        className="absolute top-2 right-0.75 flex size-11.25 items-center justify-center"
      >
        <img src={homeIconUrl} alt="" width={17} height={19} />
      </Link>
    </header>
  )
}
