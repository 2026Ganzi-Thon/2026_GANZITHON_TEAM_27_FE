import { useCaseSummary, useProsecutionDraft, useSubmitEvidence } from '../hooks/useProsecution'
import { getProsecutionErrorState, toEvidencePayload, toProsecutionView } from '../utils'
import { ProsecutionCaseBanner } from './ProsecutionCaseBanner'
import { ProsecutionChargeCard } from './ProsecutionChargeCard'
import { ProsecutionEvidenceCard } from './ProsecutionEvidenceCard'
import { ProsecutionHeader } from './ProsecutionHeader'
import { ProsecutionHero } from './ProsecutionHero'
import { ProsecutionPatternCard } from './ProsecutionPatternCard'
import { ProsecutionStartButton } from './ProsecutionStartButton'

/**
 * 기소 화면 본문 (Figma `2-1 기소`, 402×874).
 * 기소 초안과 사건번호를 불러와 보여주고, "변론 시작"에서 증거를 확정한다.
 * 로딩·오류(재시도)·확정 실패 상태를 함께 처리한다.
 *
 * - 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 * - 본문 좌우 여백은 Figma 카드 위치(x 17~386)에 맞춰 왼쪽 17px, 오른쪽 16px이다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 * @param {() => void} props.onDefenseStart 증거 확정에 성공했을 때 호출하는 핸들러
 */
export const ProsecutionView = ({ caseId, onDefenseStart }) => {
  const caseQuery = useCaseSummary(caseId)
  const draftQuery = useProsecutionDraft(caseId)
  const submitMutation = useSubmitEvidence(caseId)

  /** 기소 초안을 그대로 확정하고, 성공하면 변론 단계로 넘어간다. */
  const handleStart = () => {
    if (!draftQuery.data) return
    // TODO(API 확인 필요): 응답 outcome이 support_required이면 지원 안내 화면으로 보낸다.
    submitMutation.mutate(toEvidencePayload(draftQuery.data), { onSuccess: onDefenseStart })
  }

  const renderBody = () => {
    if (draftQuery.isPending) {
      return (
        <p role="status" className="m-auto text-sm text-muted">
          검사가 기소장을 작성하고 있어요…
        </p>
      )
    }

    if (draftQuery.isError) {
      const { message, canRetry } = getProsecutionErrorState(draftQuery.error)
      return (
        <div role="alert" className="m-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-ink">{message}</p>
          {canRetry && (
            <button
              type="button"
              onClick={() => draftQuery.refetch()}
              disabled={draftQuery.isFetching}
              className="min-h-11 rounded-full bg-ink px-6 text-sm font-semibold text-field disabled:opacity-60"
            >
              {draftQuery.isFetching ? '다시 불러오는 중…' : '다시 시도'}
            </button>
          )}
        </div>
      )
    }

    const view = toProsecutionView(draftQuery.data)
    const submitError = submitMutation.isError
      ? getProsecutionErrorState(submitMutation.error).message
      : null

    return (
      <>
        <ProsecutionHero />
        <ProsecutionCaseBanner caseNumber={caseQuery.data?.case_number} title={view.title} />
        <ProsecutionChargeCard claim={view.claim} />
        <ProsecutionPatternCard patterns={view.patterns} />
        {/* TODO(피그마 확인 필요): 증거 수정 화면·모달이 정해지면 onEdit을 실제 동작에 연결한다. */}
        <ProsecutionEvidenceCard evidence={view.evidence} onEdit={() => {}} />
        {submitError && (
          <p role="alert" className="mt-4 text-center text-sm text-danger">
            {submitError}
          </p>
        )}
        <ProsecutionStartButton onStart={handleStart} isLoading={submitMutation.isPending} />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-status-bar">
      <ProsecutionHeader />
      <div className="flex flex-1 flex-col pr-4 pl-4.25">{renderBody()}</div>
    </div>
  )
}
