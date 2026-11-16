import { useState } from 'react'
import { useDecisionDraft, useRephraseDecision } from '../hooks/useDecision'
import { getDecisionErrorState, toFinalPayload, validateStatement } from '../utils'
import { DecisionBanner } from './DecisionBanner'
import { DecisionHeader } from './DecisionHeader'
import { DecisionHero } from './DecisionHero'
import { DecisionPointCard } from './DecisionPointCard'
import { DecisionSaveButton } from './DecisionSaveButton'
import { DecisionStatementCard } from './DecisionStatementCard'

/**
 * 판결 화면 본문 (Figma `2-4 판결, 2-5 최종 진술문`, 402×874).
 * 판결 초안(사실인 부분·과장된 부분·수정된 생각)을 보여주고, "사건파일 저장하기"로 판결을 확정한다.
 * 로딩·오류(재시도)·재표현·직접 수정·저장 실패 상태를 함께 처리한다.
 *
 * - 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 * - 본문 좌우 여백은 Figma 카드 위치(x 17~384)에 맞춰 왼쪽 17px, 오른쪽 18px이다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 * @param {(decision: {decision_type: string, final_statement?: string}) => void} props.onSave
 *   "사건파일 저장하기"를 누르면 고른 판결 유형과 최종 진술문(직접 고쳤으면 고친 문장)과 함께 호출한다.
 *   판결 확정(`PUT /cases/{caseId}/decision/final`)은 여기서 하지 않고, 감정 변화 화면 "다음"에서 감정과 함께 한다.
 */
export const DecisionView = ({ caseId, onSave }) => {
  const draftQuery = useDecisionDraft(caseId)
  const rephraseMutation = useRephraseDecision(caseId)
  // 다음 화면으로 넘어가는 중이면 버튼을 다시 누를 수 없게 한다.
  const [isLeaving, setIsLeaving] = useState(false)

  // 사용자가 직접 고친 문장. null이면 서버가 제안한 문장을 그대로 쓴다.
  const [editedStatement, setEditedStatement] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [validationError, setValidationError] = useState(null)

  const renderBody = () => {
    if (draftQuery.isPending) {
      // TODO(피그마 확인 필요): 판결 초안을 만드는 동안의 로딩 화면 디자인이 없다.
      return (
        <p role="status" className="m-auto text-sm text-muted">
          판사가 판결문을 작성하고 있어요…
        </p>
      )
    }

    if (draftQuery.isError) {
      // TODO(피그마 확인 필요): 판결 초안 실패 화면 디자인이 없다.
      const { message, canRetry } = getDecisionErrorState(draftQuery.error)
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

    // TODO(API 확인 필요): 응답 outcome이 support_required이면 지원 안내 화면(Figma `5-1 위기 안내`)으로 보낸다.
    const { decision } = draftQuery.data
    const statement = editedStatement ?? decision.suggested_statement

    /** 연필 버튼: 수정을 시작하거나, 입력을 검사한 뒤 수정을 끝낸다. */
    const handleEditToggle = () => {
      if (!isEditing) {
        setEditedStatement(statement)
        setIsEditing(true)
        return
      }
      const error = validateStatement(statement, decision.type)
      setValidationError(error)
      if (!error) setIsEditing(false)
    }

    /** 회전 버튼: 다른 표현을 받고, 직접 고친 문장은 버린다. */
    const handleRephrase = () => {
      // TODO(피그마 확인 필요): 재표현 스타일(neutral·shorter·gentler) 선택 UI가 없어 neutral로 보낸다.
      rephraseMutation.mutate(
        { style: 'neutral', version: decision.version },
        { onSuccess: () => setEditedStatement(null) },
      )
    }

    /** 저장: 진술문을 검사하고, 판결 유형과 최종 진술문을 들고 다음 화면(감정 변화)으로 넘어간다. */
    const handleSave = () => {
      if (isLeaving) return
      const error = validateStatement(statement, decision.type)
      setValidationError(error)
      if (error) return
      setIsEditing(false)
      setIsLeaving(true)
      onSave(toFinalPayload(decision.type, statement))
    }

    const statementError =
      validationError ??
      (rephraseMutation.isError ? getDecisionErrorState(rephraseMutation.error).message : null)

    return (
      <>
        <DecisionHero />
        <DecisionBanner decisionType={decision.type} />
        <DecisionPointCard title="사실인 부분" items={decision.reported_facts} />
        <DecisionPointCard title="과장된 부분" items={decision.unsupported_claims} variant="dark" />
        <DecisionStatementCard
          statement={statement}
          isEditing={isEditing}
          onChange={setEditedStatement}
          onEditToggle={handleEditToggle}
          onRephrase={handleRephrase}
          isRephrasing={rephraseMutation.isPending}
          errorMessage={statementError}
        />
        <DecisionSaveButton onSave={handleSave} isSaving={isLeaving} />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-status-bar">
      <DecisionHeader />
      <div className="flex flex-1 flex-col pr-4.5 pl-4.25">{renderBody()}</div>
    </div>
  )
}
