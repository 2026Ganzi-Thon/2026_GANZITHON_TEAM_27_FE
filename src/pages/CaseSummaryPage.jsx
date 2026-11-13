import { useParams } from 'react-router-dom'
import { SummaryView } from '@/features/summary'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건요약 화면 입구 (Figma `사건요약`). 주소의 사건 ID와 버튼 이동 주소를 summary feature에 넘긴다.
 *
 * TODO(피그마 확인 필요): "확인" 이후 이동할 화면이 정해지지 않아 홈으로 보낸다.
 * TODO(피그마 확인 필요): "사건카드 만들기"는 사건 카드(PNG) 화면으로 가야 하지만 화면이 없어 홈으로 보낸다.
 * TODO(피그마 확인 필요): 공유 동작이 정해지지 않아 onShare를 넘기지 않는다(공유 버튼 비활성).
 */
const CaseSummaryPage = () => {
  const { caseId } = useParams()
  return <SummaryView caseId={caseId} confirmTo={ROUTE_PATHS.home} makeCardTo={ROUTE_PATHS.home} />
}

export default CaseSummaryPage
