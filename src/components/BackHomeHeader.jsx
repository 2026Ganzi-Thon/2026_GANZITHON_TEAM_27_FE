import { Link } from 'react-router-dom'
import backUrl from '@/assets/back.svg'
import homeIconUrl from '@/assets/home-icon.svg'
import { PageHeader } from './PageHeader'

/**
 * 뒤로 가기(왼쪽)와 홈으로 가는 아이콘(오른쪽)이 달린 제목줄. 사건 접수와 게시판 공유 화면에서 함께 쓴다.
 *
 * @param {{ title: string, homeTo: string, onBack: () => void, wide?: boolean }} props
 * - `title`: 가운데 제목
 * - `homeTo`: 홈 아이콘이 이동할 주소
 * - `onBack`: 뒤로 가기를 눌렀을 때 실행한다
 * - `wide`: 제목이 긴 화면에서 별 사이를 더 벌린다(`PageHeader`와 같다)
 */
export const BackHomeHeader = ({ title, homeTo, onBack, wide = false }) => (
  <PageHeader
    title={title}
    wide={wide}
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
