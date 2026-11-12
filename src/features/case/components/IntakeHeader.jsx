import { Link } from 'react-router-dom'
import backUrl from '@/assets/intake/back.svg'
import homeIconUrl from '@/assets/intake/home-icon.svg'
import starsUrl from '@/assets/intake/header-stars.svg'

/**
 * 사건 접수 화면 상단. 뒤로 가기, 가운데 제목("사건 접수")과 별 장식, 홈으로 가는 아이콘을 보여준다.
 *
 * @param {{ homeTo: string, onBack: () => void }} props
 * - `homeTo`: 홈 아이콘이 이동할 주소
 * - `onBack`: 뒤로 가기를 눌렀을 때 실행한다
 */
export const IntakeHeader = ({ homeTo, onBack }) => (
  <header className="relative h-11 shrink-0">
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로 가기"
      className="absolute top-0 left-1 flex size-11 items-center justify-center"
    >
      <img src={backUrl} alt="" width={15} height={8} className="rotate-90" />
    </button>
    <img
      src={starsUrl}
      alt=""
      width={277}
      height={15}
      className="absolute top-2.25 left-15.75"
      aria-hidden="true"
    />
    <h1 className="absolute top-0.25 left-1/2 -translate-x-1/2 bg-canvas px-2.5 text-base font-semibold text-ink">
      사건 접수
    </h1>
    <Link
      to={homeTo}
      aria-label="홈으로 가기"
      className="absolute top-0 right-1 flex size-11 items-center justify-center"
    >
      <img src={homeIconUrl} alt="" width={17} height={19} />
    </Link>
  </header>
)
