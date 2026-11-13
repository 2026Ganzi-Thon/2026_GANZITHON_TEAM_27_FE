import { useParams } from 'react-router-dom'
import { ClosingView } from '@/features/closing'
import { getCaseSummaryPath, ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건 종결 화면 입구 (Figma `2-8 종결`). 감정 변화 "다음"(판결 확정 성공)에서 들어온다.
 * 카드와 확인 버튼의 이동 주소를 정해 closing feature에 넘긴다. 종결 화면은 고정 문구라 API를 부르지 않는다.
 *
 * - "확인" → 같은 사건의 사건요약 화면
 * TODO(기획 확인 필요): "사건파일 요약"·"감정 변화 확인" 카드의 이동 화면이 정해지지 않아 지금은 홈으로 보낸다.
 */
const CaseClosingPage = () => {
  const { caseId } = useParams()
  return (
    <ClosingView
      summaryTo={ROUTE_PATHS.home}
      emotionTo={ROUTE_PATHS.home}
      confirmTo={getCaseSummaryPath(caseId)}
    />
  )
}

export default CaseClosingPage
