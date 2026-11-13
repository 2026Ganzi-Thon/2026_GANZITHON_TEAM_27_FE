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
 * TODO(API 확인 필요): `support_required`면 위기 안내 화면(`/support`, feat/crisis-support)으로 보낸다.
 * 위기 안내 화면이 이 브랜치에 합쳐지기 전까지는 법정 흐름을 멈추고 홈으로 보낸다.
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
      // TODO(API 확인 필요): 위기 안내 화면(/support)이 합쳐지면 그 주소로 바꾼다.
      onSupportRequired={() => navigate(ROUTE_PATHS.home, { replace: true })}
    />
  )
}

export default ActionSuggestionPage
