import { Link } from 'react-router-dom'
import backUrl from '@/assets/intake/back.svg'
import homeIconUrl from '@/assets/intake/home-icon.svg'
import { PageHeader } from '@/components/PageHeader'

/**
 * 사건 접수 화면 상단. 공통 제목줄(`PageHeader`)에 뒤로 가기와 홈으로 가는 아이콘을 붙인다.
 *
 * @param {{ homeTo: string, onBack: () => void }} props
 * - `homeTo`: 홈 아이콘이 이동할 주소
 * - `onBack`: 뒤로 가기를 눌렀을 때 실행한다
 */
export const IntakeHeader = ({ homeTo, onBack }) => (
  <PageHeader
    title="사건 접수"
    left={
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="flex size-11 items-center justify-center"
      >
        <img src={backUrl} alt="" width={15} height={8} className="rotate-90" />
      </button>
    }
    right={
      <Link
        to={homeTo}
        aria-label="홈으로 가기"
        className="flex size-11 items-center justify-center"
      >
        <img src={homeIconUrl} alt="" width={17} height={19} />
      </Link>
    }
  />
)
