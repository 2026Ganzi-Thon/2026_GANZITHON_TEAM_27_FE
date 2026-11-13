import { Link, useNavigate } from 'react-router-dom'
import backArrowUrl from '@/assets/prosecution/back-arrow.svg'
import headerStarsUrl from '@/assets/prosecution/header-stars.svg'
import homeIconUrl from '@/assets/prosecution/home-icon.svg'

/**
 * 기소 화면 상단 네비게이션 헤더 (Figma y 44~110 구간).
 * 뒤로가기, 가운데 별 장식과 제목, 홈 바로가기를 보여준다.
 * 아이콘 버튼은 아이콘 중심이 Figma 위치와 같도록 45×45 클릭 영역의 가운데에 아이콘을 둔다.
 *
 * @param {object} props
 * @param {string} [props.homeTo] 홈 이동 링크 주소 (기본값: '/')
 * @param {() => void} [props.onBack] 뒤로가기 핸들러. 없으면 브라우저 이전 기록으로 이동한다.
 * @param {import('react').Ref<HTMLButtonElement>} [props.backButtonRef] 뒤로가기 버튼 ref (모달을 닫은 뒤 포커스를 돌려줄 때 쓴다)
 */
export const ProsecutionHeader = ({ homeTo = '/', onBack, backButtonRef }) => {
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
      <img
        src={headerStarsUrl}
        alt=""
        width={277}
        height={15}
        className="absolute top-5.25 left-1/2 -ml-34.5 max-w-none select-none"
      />
      <h1 className="absolute top-5.25 left-1/2 -translate-x-1/2 text-base leading-auto font-semibold">
        기소
      </h1>

      {/* 아이콘 중심: Figma (25, 72.5) */}
      <button
        ref={backButtonRef}
        type="button"
        onClick={handleBack}
        aria-label="뒤로 가기"
        className="absolute top-1.5 left-0.75 flex h-11.25 w-11 items-center justify-center"
      >
        {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
        <img src={backArrowUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
      </button>

      {/* 아이콘 중심: Figma (369.5, 73.5) */}
      <Link
        to={homeTo}
        aria-label="홈으로 이동"
        className="absolute top-1.75 right-2.5 flex size-11.25 items-center justify-center"
      >
        <img src={homeIconUrl} alt="" width={17} height={19} />
      </Link>
    </header>
  )
}
