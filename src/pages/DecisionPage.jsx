import { useNavigate, useParams } from 'react-router-dom'
import { DecisionView } from '@/features/decision'
import { getEmotionPath } from '@/routes/paths'

/**
 * 판결 화면 입구 (Figma `2-4 판결, 2-5 최종 진술문`). 주소의 사건 ID를 decision feature에 넘긴다.
 */
const DecisionPage = () => {
  const navigate = useNavigate()
  const { caseId } = useParams()

  /**
   * "사건파일 저장하기": 고른 판결 유형과 최종 진술문을 들고 같은 사건의 감정 변화 화면으로 간다.
   * 판결 확정 API는 감정 변화 화면 "다음"에서 감정과 함께 부른다(여기서는 부르지 않는다).
   * 판결 내용은 이동 기록(location.state)에만 담는다. 같은 탭에서는 새로고침해도 남고, 서버·전역 상태에는 저장하지 않는다.
   */
  const handleSave = (decision) => {
    navigate(getEmotionPath(caseId), { state: { decision } })
  }

  return <DecisionView caseId={caseId} onSave={handleSave} />
}

export default DecisionPage
