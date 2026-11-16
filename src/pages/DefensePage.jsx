import { useNavigate, useParams } from 'react-router-dom'
import { DefenseView } from '@/features/defense'
import { getDecisionPath, ROUTE_PATHS } from '@/routes/paths'

/**
 * 변론(AI 챗봇) 화면 입구 (Figma `Ai챗봇`). 주소의 사건 ID를 defense feature에 넘긴다.
 * "변론 종료"는 같은 사건의 판결 화면으로 이동만 한다. 판결 초안(`POST /cases/{caseId}/decision`)은 판결 화면이 열릴 때 요청한다.
 */
const DefensePage = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()

  /**
   * 답변에서 위기 신호가 감지되면(서버 응답 `support_required`) 법정 흐름을 멈추고 위기 안내 화면으로 간다.
   * replace로 이동해 뒤로 가기로 대화 화면에 돌아오지 않는다. 주소에는 아무 내용도 담지 않는다.
   * TODO(기획 확인 필요: 위기 안내 후 뒤로가기·"계속할게요" 버튼 동작) 지금은 브라우저 뒤로 가기가 그 전 화면(기소)으로 간다.
   * 법정 흐름을 완전히 멈출지(뒤로 가기도 홈으로), "계속할게요"를 누르면 어디로 갈지 정해지면 맞춘다.
   * TODO(이어하기와 함께 연결): 사건 status가 support_required로 바뀌므로, 나중에 이 사건의 변론 화면을 다시 열면
   * GET /cases/{caseId}의 status를 보고 위기 안내 화면으로 보낸다.
   */
  const handleSupportRequired = () => navigate(ROUTE_PATHS.crisisSupport, { replace: true })

  return (
    <DefenseView
      caseId={caseId}
      finishTo={getDecisionPath(caseId)}
      onSupportRequired={handleSupportRequired}
    />
  )
}

export default DefensePage
