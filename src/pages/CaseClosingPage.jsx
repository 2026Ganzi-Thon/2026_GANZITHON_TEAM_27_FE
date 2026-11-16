import { useParams } from 'react-router-dom'
import { ClosingView } from '@/features/closing'
import { getCaseSummaryPath } from '@/routes/paths'

/** 종결 안내의 확인 버튼을 같은 사건의 요약 화면으로 연결한다. */
const CaseClosingPage = () => {
  const { caseId } = useParams()
  return <ClosingView confirmTo={getCaseSummaryPath(caseId)} />
}

export default CaseClosingPage
