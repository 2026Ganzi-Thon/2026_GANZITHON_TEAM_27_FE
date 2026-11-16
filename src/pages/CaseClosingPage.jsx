import { useParams } from 'react-router-dom'
import { ClosingView } from '@/features/closing'
import { SUMMARY_EMOTION_SECTION } from '@/features/summary'
import { getCaseSummaryPath } from '@/routes/paths'

/**
 * 사건 종결 화면 입구 (Figma `2-8 종결`). 감정 변화 "다음"(판결 확정 성공)에서 들어온다.
 * 카드와 확인 버튼의 이동 주소를 정해 closing feature에 넘긴다. 종결 화면은 고정 문구라 API를 부르지 않는다.
 *
 * - "확인", "사건파일 요약" 카드 → 같은 사건의 사건요약 화면(맨 위)
 * - "감정 변화 확인" 카드 → 같은 사건의 사건요약 화면, 감정 변화 그래프 위치(`#emotion`)
 * TODO(피그마 확인 필요: 감정 변화 확인 전용 화면 여부) 전용 화면이 없어 사건요약의 그래프로 보낸다.
 */
const CaseClosingPage = () => {
  const { caseId } = useParams()
  const summaryPath = getCaseSummaryPath(caseId)
  return (
    <ClosingView
      summaryTo={summaryPath}
      emotionTo={`${summaryPath}#${SUMMARY_EMOTION_SECTION}`}
      confirmTo={summaryPath}
    />
  )
}

export default CaseClosingPage
