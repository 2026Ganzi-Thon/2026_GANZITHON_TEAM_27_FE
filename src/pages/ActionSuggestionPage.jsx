import { useNavigate, useParams } from 'react-router-dom'
import { ActionSuggestionView } from '@/features/action'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 행동 제안 화면 입구 (`/cases/:caseId/action`). 확인용 주소: `/cases/sample/action`
 *
 * 사건요약 화면 "확인"에서 들어온다(판결 → 감정 변화 → 종결 → 사건요약 → 행동 제안 → 홈).
 * "LET’S DO IT"·"오늘은 쉬기"는 `PUT /cases/{caseId}/follow-up`에 성공하면 홈으로 간다(법정 흐름의 끝).
 * 카드는 고르기만 하고 이동하지 않는다.
 *
 * 저장 응답이 `support_required`면(명세 §2.1: 종결 뒤 행동 입력은 그 요청만 중단, 종결 기록은 보존)
 * 법정 흐름을 멈추고 위기 안내 화면으로 replace 이동한다. 뒤로 가기로 행동 제안 화면에 돌아오지 않고, 주소에는 아무 내용도 담지 않는다.
 */
const ActionSuggestionPage = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()

  return (
    <ActionSuggestionView
      caseId={caseId}
      onBack={() => navigate(-1)}
      homeTo={ROUTE_PATHS.home}
      onDone={() => navigate(ROUTE_PATHS.home)}
      onSupportRequired={() => navigate(ROUTE_PATHS.crisisSupport, { replace: true })}
    />
  )
}

export default ActionSuggestionPage
