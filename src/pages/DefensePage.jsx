import { useParams } from 'react-router-dom'
import { DefenseView } from '@/features/defense'
import { getDecisionPath } from '@/routes/paths'

/**
 * 변론(AI 챗봇) 화면 입구 (Figma `Ai챗봇`). 주소의 사건 ID를 defense feature에 넘긴다.
 * "변론 종료"는 같은 사건의 판결 화면으로 이동만 한다. 판결 초안(`POST /cases/{caseId}/decision`)은 판결 화면이 열릴 때 요청한다.
 */
const DefensePage = () => {
  const { caseId } = useParams()
  return <DefenseView caseId={caseId} finishTo={getDecisionPath(caseId)} />
}

export default DefensePage
