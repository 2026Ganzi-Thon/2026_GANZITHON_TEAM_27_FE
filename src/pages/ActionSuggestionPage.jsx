import { useNavigate, useParams } from 'react-router-dom'
import { ActionSuggestionView } from '@/features/action'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 행동 제안 화면 입구 (`/cases/:caseId/action`). 확인용 주소: `/cases/sample/action`
 *
 * TODO(피그마 확인 필요): 다음 화면은 Figma 흐름상 `2-8 종결`이지만 이 브랜치(dev 기준)에 종결 라우트가 없어 홈으로 보낸다.
 * TODO(API 확인 필요): `support_required`면 위기 안내 화면(`/support`, feat/crisis-support)으로 갈 예정이다.
 * 그 라우트가 합쳐지기 전까지는 법정 흐름을 멈추고 홈으로 보낸다.
 * 감정 변화 화면의 "다음" 버튼과는 아직 연결하지 않았다.
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
      onSupportRequired={() => navigate(ROUTE_PATHS.home, { replace: true })}
    />
  )
}

export default ActionSuggestionPage
