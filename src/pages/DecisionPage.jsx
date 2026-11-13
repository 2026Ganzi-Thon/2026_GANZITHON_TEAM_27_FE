import { useNavigate, useParams } from 'react-router-dom'
import { DecisionView } from '@/features/decision'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 판결 화면 입구 (Figma `2-4 판결, 2-5 최종 진술문`). 주소의 사건 ID를 decision feature에 넘긴다.
 */
const DecisionPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  /** 판결 확정에 성공하면 다음 화면으로 이동한다. */
  const handleSaved = () => {
    // TODO(피그마 확인 필요): 다음 화면(`2-6 감정변화` 또는 `2-8 종결`) 라우트가 생기면 그 주소로 이동한다. 지금은 홈으로 보낸다.
    navigate(ROUTE_PATHS.home)
  }

  return <DecisionView caseId={id} onSaved={handleSaved} />
}

export default DecisionPage
