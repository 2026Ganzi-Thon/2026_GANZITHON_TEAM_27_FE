import { useParams } from 'react-router-dom'
import { DefenseView } from '@/features/defense'

/**
 * 변론(AI 챗봇) 화면 입구 (Figma `Ai챗봇`). 주소의 사건 ID를 defense feature에 넘긴다.
 */
const DefensePage = () => {
  const { id } = useParams()
  return <DefenseView caseId={id} />
}

export default DefensePage
