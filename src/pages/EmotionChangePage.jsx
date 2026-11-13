import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCase } from '@/features/case'
import { getDecisionErrorState, toFinalRequest, useFinalizeDecision } from '@/features/decision'
import { EmotionChangeView, toIntakeEmotion } from '@/features/emotion'
import { getCaseActionPath, getDecisionPath } from '@/routes/paths'

/**
 * 감정 변화 화면 입구 (Figma `2-6 감정변화`). 주소의 사건 ID를 emotion feature에 넘긴다.
 *
 * 접수 당시 감정은 동료의 공용 사건 조회(`useCase`, `GET /cases/{caseId}` 역할)로 읽는다.
 * 지금은 목업 저장소(사건 접수 화면이 저장한 사건, `sample`은 예시 사건)에서 같은 caseId 사건을 찾는다.
 * TODO(API 확인 필요): 동료의 `getCase`가 실제 API(`apiClient.get`)로 바뀌면 이 화면도 함께 실제 API를 쓴다.
 *
 * 판결 화면 "사건파일 저장하기"에서 고른 판결 유형·최종 진술문(location.state.decision)을 받아,
 * "다음"에서 지금 감정(emotion_after)과 함께 판결을 확정한다(`PUT /cases/{caseId}/decision/final`).
 *
 * 판결 내용 없이 바로 들어온 경우(주소를 직접 열기, 새 탭 등)
 * - 제안: 판결 화면으로 돌려보낸다. 직접 고친 진술문은 기기에만 있고 서버(`GET /cases/{caseId}`)에는 없어서,
 *   다시 불러오면 사용자가 고친 문장 대신 제안 문장으로 확정될 수 있다. 판결 화면에서 다시 확인하는 쪽이 안전하다.
 * - 지금(최소 처리): 화면은 보여주고, "다음"을 누르면 확정하지 않고 판결 화면으로 돌려보낸다.
 * TODO(API 확인 필요): 사건 status가 이미 closed면(다른 기기에서 확정 등) 판결 화면 대신 다음 단계로 보낸다.
 */
const EmotionChangePage = () => {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const decision = useLocation().state?.decision ?? null
  const caseQuery = useCase(caseId)
  // 불러오는 중·실패는 지금처럼 보여주고, 사건이 없거나 접수 때 감정을 입력하지 않았으면 "기록 없음"이다.
  const intake = caseQuery.isPending
    ? { status: 'loading' }
    : caseQuery.isError
      ? { status: 'error', onRetry: () => caseQuery.refetch() }
      : { status: 'ready', emotion: toIntakeEmotion(caseQuery.data) }
  const finalizeMutation = useFinalizeDecision(caseId)
  // 다음 화면으로 넘어가는 중이면 버튼을 다시 누를 수 없게 한다.
  const [isLeaving, setIsLeaving] = useState(false)

  /** 지금 감정과 판결 내용을 함께 보내 판결을 확정하고 다음 화면으로 이동한다. */
  const handleNext = (emotionAfter) => {
    if (finalizeMutation.isPending || isLeaving) return
    if (!decision) {
      // TODO(기획 확인 필요): 판결 내용 없이 들어온 경우의 안내 문구·디자인이 없다. 지금은 판결 화면으로 돌려보낸다.
      setIsLeaving(true)
      navigate(getDecisionPath(caseId), { replace: true })
      return
    }
    finalizeMutation.mutate(toFinalRequest(decision, emotionAfter), {
      onSuccess: () => {
        // TODO(API 확인 필요): 응답 outcome이 support_required이면 위기 안내 화면(/support)으로 보낸다.
        // 판결 확정에 성공하면 같은 사건의 행동 제안 화면(Figma `2-7 행동제안`)으로 간다.
        setIsLeaving(true)
        navigate(getCaseActionPath(caseId))
      },
    })
  }

  return (
    <EmotionChangeView
      intake={intake}
      onNext={handleNext}
      isSubmitting={finalizeMutation.isPending || isLeaving}
      errorMessage={
        finalizeMutation.isError ? getDecisionErrorState(finalizeMutation.error).message : null
      }
    />
  )
}

export default EmotionChangePage
