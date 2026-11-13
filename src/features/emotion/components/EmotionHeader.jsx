import { Link, useNavigate } from 'react-router-dom'
// 사건 접수 화면(동료)의 아이콘과 같은 에셋이다(렌더 비교 차이 0%). 복사하지 않고 그대로 가져다 쓴다.
import backUrl from '@/assets/intake/back.svg'
import homeIconUrl from '@/assets/intake/home-icon.svg'

/**
 * 감정 변화 화면 상단 네비게이션 헤더 (Figma y 44~110 구간). 이 화면은 별 장식이 없다.
 * 아이콘 버튼은 아이콘 중심이 Figma 위치와 같도록 45×45 클릭 영역의 가운데에 아이콘을 둔다.
 * TODO(공통화 검토): 기소·변론·판결·접수 헤더와 구조가 같다. 공용 헤더로 뺄지 동료와 정한다.
 *
 * @param {object} props
 * @param {string} [props.homeTo] 홈 이동 링크 주소 (기본값: '/')
 * @param {() => void} [props.onBack] 뒤로가기 핸들러. 없으면 브라우저 이전 기록으로 이동한다.
 */
export const EmotionHeader = ({ homeTo = '/', onBack }) => {
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
    <header className="relative h-16.5 shrink-0 text-ink">
      {/* Figma 제목: x 173, y 65 */}
      <h1 className="absolute top-5.25 left-43.25 text-base leading-[normal] font-semibold">
        감정 확인
      </h1>

      {/* 아이콘 중심: Figma (25, 72.5) */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="뒤로 가기"
        className="absolute top-1.5 left-0.75 flex h-11.25 w-11 items-center justify-center"
      >
        {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
        <img src={backUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
      </button>

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
}
