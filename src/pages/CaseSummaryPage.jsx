import { useParams } from 'react-router-dom'
import { SummaryView } from '@/features/summary'
import { getCaseActionPath, getCaseCardPath } from '@/routes/paths'

/**
 * 사건요약 화면 입구 (Figma `사건요약`). 종결 화면 "확인"에서 들어온다.
 * 주소의 사건 ID와 버튼 이동 주소를 summary feature에 넘긴다.
 *
 * - "확인" → 같은 사건의 행동 제안 화면
 * - "사건카드 만들기" → 같은 사건의 사건 카드 화면(동료 화면, `getCaseCardPath`)
 * TODO(피그마 확인 필요): 공유 동작이 정해지지 않아 onShare를 넘기지 않는다(공유 버튼 비활성).
 */
const CaseSummaryPage = () => {
  const { caseId } = useParams()
  return (
    <SummaryView
      caseId={caseId}
      confirmTo={getCaseActionPath(caseId)}
      makeCardTo={getCaseCardPath(caseId)}
    />
  )
}

export default CaseSummaryPage
