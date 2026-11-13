import { useNavigate, useParams } from 'react-router-dom'
import { ProsecutionView } from '@/features/prosecution'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 기소 화면 입구 (Figma `2-1 기소`). 주소의 사건 ID를 prosecution feature에 넘긴다.
 */
const ProsecutionPage = () => {
  const navigate = useNavigate()
  const { caseId } = useParams()

  /** 증거 확정에 성공하면 변론 화면으로 이동한다. */
  const handleDefenseStart = () => {
    // TODO(피그마 확인 필요): 변론 화면 라우트가 생기면 그 주소로 이동한다. 지금은 홈으로 보낸다.
    navigate(ROUTE_PATHS.home)
  }

  return <ProsecutionView caseId={caseId} onDefenseStart={handleDefenseStart} />
}

export default ProsecutionPage
