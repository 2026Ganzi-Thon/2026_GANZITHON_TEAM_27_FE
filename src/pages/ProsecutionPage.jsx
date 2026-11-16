import { useNavigate, useParams } from 'react-router-dom'
import { ProsecutionView } from '@/features/prosecution'
import { getDefensePath, ROUTE_PATHS } from '@/routes/paths'

/**
 * 기소 화면 입구 (Figma `2-1 기소`). 주소의 사건 ID를 prosecution feature에 넘긴다.
 */
const ProsecutionPage = () => {
  const navigate = useNavigate()
  const { caseId } = useParams()

  /** "변론 시작"에서 근거 확정(`PUT /cases/{caseId}/evidence`)에 성공하면 같은 사건의 변론 화면으로 이동한다. */
  const handleDefenseStart = () => {
    navigate(getDefensePath(caseId))
  }

  /** 휴정 모달에서 "휴정하기"를 누르면 홈으로 간다. 서버 API는 부르지 않는다(서버가 사건 상태를 유지한다). */
  const handleRecess = () => {
    navigate(ROUTE_PATHS.home)
  }

  return (
    <ProsecutionView caseId={caseId} onDefenseStart={handleDefenseStart} onRecess={handleRecess} />
  )
}

export default ProsecutionPage
