import { useNavigate, useParams } from 'react-router-dom'
import { EmotionChangeView } from '@/features/emotion'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 감정 변화 화면 입구 (Figma `2-6 감정변화`). 주소의 사건 ID를 emotion feature에 넘긴다.
 */
const EmotionChangePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  /** 지금 감정을 받아 다음 화면으로 이동한다. */
  const handleNext = () => {
    // TODO(API 확인 필요): 종결 시점 감정(emotion_after)은 판결 확정 API(PUT /cases/{id}/decision/final)에 함께 보낸다.
    // 판결(decision) 작업이 dev에 합쳐지면 판결 내용과 함께 확정하도록 연결한다.
    // TODO(피그마 확인 필요): 다음 화면(`2-7 행동제안`) 라우트가 생기면 그 주소로 이동한다. 지금은 홈으로 보낸다.
    navigate(ROUTE_PATHS.home)
  }

  return <EmotionChangeView caseId={id} onNext={handleNext} />
}

export default EmotionChangePage
