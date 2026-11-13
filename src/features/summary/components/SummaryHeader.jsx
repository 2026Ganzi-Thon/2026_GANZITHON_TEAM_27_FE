import { useNavigate } from 'react-router-dom'
// 사건 접수 화면(동료)의 뒤로가기 아이콘과 같은 에셋이다. 복사하지 않고 그대로 가져다 쓴다.
import backUrl from '@/assets/intake/back.svg'
import shareIconUrl from '@/assets/summary/icon-share.svg'
import { PageHeader } from '@/components/PageHeader'

/**
 * 사건요약 화면 상단 (Figma y 65). 동료의 공통 제목줄(PageHeader)에 뒤로가기와 공유 버튼을 넣는다.
 *
 * TODO(공통화 검토: PageHeader 버튼 위치) PageHeader의 양쪽 버튼 자리는 이 화면 Figma와 다르다.
 * 동료 파일을 고치지 않고 여기서만 보정한다: 뒤로가기 왼쪽 1px, 공유 왼쪽 7.5px·위 1px.
 * (Figma 아이콘 중심: 뒤로가기 (25, 72.5), 공유 (368.5, 71.5))
 *
 * @param {object} props
 * @param {() => void} [props.onBack] 뒤로가기 핸들러. 없으면 브라우저 이전 기록으로 이동한다.
 * @param {() => void} [props.onShare] 공유 핸들러. 없으면 공유 버튼을 비활성으로 둔다.
 */
export const SummaryHeader = ({ onBack, onShare }) => {
  const navigate = useNavigate()

  return (
    <PageHeader
      title="사건파일 요약"
      left={
        <button
          type="button"
          onClick={onBack ?? (() => navigate(-1))}
          aria-label="뒤로 가기"
          className="relative -left-px flex size-11 items-center justify-center"
        >
          {/* 아래 방향 화살표 원본(15×8)을 Figma처럼 90° 돌려 왼쪽 화살표로 쓴다. */}
          <img src={backUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
        </button>
      }
      right={
        // TODO(피그마 확인 필요): 공유 동작(링크 공유인지 사건 카드 공유인지)이 정해지지 않아 비활성으로 둔다.
        <button
          type="button"
          onClick={onShare}
          disabled={!onShare}
          aria-label="공유하기"
          className="relative right-[7.5px] -top-px flex size-11 items-center justify-center"
        >
          <img src={shareIconUrl} alt="" width={23} height={23} className="max-w-none" />
        </button>
      }
    />
  )
}
