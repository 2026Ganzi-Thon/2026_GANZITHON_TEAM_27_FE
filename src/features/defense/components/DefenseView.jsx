import { useDefenseCase, useDefenseThread, useSubmitDefenseAnswer } from '../hooks/useDefense'
import { findOpenQuestion, getDefenseErrorState, toChatMessages } from '../utils'
import { ChatMessage } from './ChatMessage'
import { DefenseComposer } from './DefenseComposer'
import { DefenseHeader } from './DefenseHeader'

/**
 * 변론(AI 챗봇) 화면 본문 (Figma `Ai챗봇`, 393×852).
 * 위에서부터 헤더, 사건번호, 대화 목록(스크롤), 추천 질문·입력창이 놓인다.
 * 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 */
export const DefenseView = ({ caseId }) => {
  const caseQuery = useDefenseCase(caseId)
  const threadQuery = useDefenseThread(caseId)
  const answerMutation = useSubmitDefenseAnswer(caseId)

  const thread = threadQuery.data ?? []
  const openQuestion = findOpenQuestion(thread)

  /** 답할 질문에 답변을 보낸다. */
  const handleSubmit = (text) => {
    // TODO(API 확인 필요): 답할 질문이 없을 때(모두 답함) 입력을 어떻게 처리할지 정해지면 바꾼다.
    // 지금은 목업에서만 대화 끝에 답을 이어 붙인다.
    answerMutation.mutate({
      questionId: openQuestion?.id,
      body: { action: 'answer', text, revision: openQuestion?.revision },
    })
  }

  const renderMessages = () => {
    if (threadQuery.isPending) {
      return (
        <p role="status" className="m-auto text-sm text-muted">
          변호인이 질문을 준비하고 있어요…
        </p>
      )
    }

    if (threadQuery.isError) {
      const { message, canRetry } = getDefenseErrorState(threadQuery.error)
      return (
        <div role="alert" className="m-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-ink">{message}</p>
          {canRetry && (
            <button
              type="button"
              onClick={() => threadQuery.refetch()}
              disabled={threadQuery.isFetching}
              className="min-h-11 rounded-full bg-ink px-6 text-sm font-semibold text-field disabled:opacity-60"
            >
              {threadQuery.isFetching ? '다시 불러오는 중…' : '다시 시도'}
            </button>
          )}
        </div>
      )
    }

    return (
      <ol aria-label="변론 대화" className="flex flex-col gap-5.25 pt-4.75">
        {toChatMessages(thread).map((message) => (
          <ChatMessage key={message.key} from={message.from} text={message.text} />
        ))}
      </ol>
    )
  }

  const submitError = answerMutation.isError
    ? getDefenseErrorState(answerMutation.error).message
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas pt-status-bar">
      <DefenseHeader />
      {/* Figma 사건번호 줄: x 148, y 123. Figma처럼 왼쪽 위치 기준으로 둔다(402px 화면에서 가운데). */}
      <p className="mt-3.25 h-3.5 shrink-0 pl-37 text-xs leading-auto text-black">
        {caseQuery.data?.case_number ? `사건번호 #${caseQuery.data.case_number}` : ''}
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{renderMessages()}</div>
      {submitError && (
        <p role="alert" className="shrink-0 pb-2 text-center text-sm text-danger">
          {submitError}
        </p>
      )}
      <DefenseComposer onSubmit={handleSubmit} isSubmitting={answerMutation.isPending} />
    </div>
  )
}
