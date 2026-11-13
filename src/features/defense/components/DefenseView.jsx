import { useEffect, useId, useRef, useState } from 'react'
import {
  useDefenseCase,
  useDefenseThread,
  useSimplifyDefenseQuestion,
  useSubmitDefenseAnswer,
} from '../hooks/useDefense'
import { canSimplify, findOpenQuestion, getDefenseErrorState, toChatMessages } from '../utils'
import { ChatMessage } from './ChatMessage'
import { DefenseComposer } from './DefenseComposer'
import { DefenseHeader } from './DefenseHeader'
import { DefenseSuggestions } from './DefenseSuggestions'

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
  const simplifyMutation = useSimplifyDefenseQuestion(caseId)

  const thread = threadQuery.data ?? []
  const openQuestion = findOpenQuestion(thread)

  // 추천 질문 패널: 열려 있으면 입력 영역을 숨기고 대화 스크롤을 막는다. 닫히면 "추천 질문" 칩으로 포커스를 돌린다.
  const suggestionsId = useId()
  const suggestionsButtonRef = useRef(null)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const wasSuggestionsOpen = useRef(false)
  useEffect(() => {
    if (wasSuggestionsOpen.current && !isSuggestionsOpen) suggestionsButtonRef.current?.focus()
    wasSuggestionsOpen.current = isSuggestionsOpen
  }, [isSuggestionsOpen])

  /**
   * 추천 질문 보기를 고르면 패널을 닫고 그 동작을 실행한다.
   * - 쉽게 바꾸기: 기존 질문은 두고 쉬운 문장을 새 AI 말풍선으로 추가한다(질문당 2회).
   * - 떠오르지 않아요·건너뛰기: 그 문구를 내 말풍선으로 보여주고 다음 질문으로 넘어간다.
   * TODO(API 확인 필요): 409(오래된 revision)면 GET /cases/{id}로 다시 조회하는 흐름은 API 연결 때 붙인다.
   */
  const handleSuggestion = (key) => {
    setIsSuggestionsOpen(false)
    if (!openQuestion) return
    if (key === 'simplify') {
      simplifyMutation.mutate({ questionId: openQuestion.id, revision: openQuestion.revision })
      return
    }
    answerMutation.mutate({
      questionId: openQuestion.id,
      body: { action: key, revision: openQuestion.revision },
    })
  }

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

  const failedMutation = [answerMutation, simplifyMutation].find((mutation) => mutation.isError)
  const submitError = failedMutation ? getDefenseErrorState(failedMutation.error).message : null
  const isWorking = answerMutation.isPending || simplifyMutation.isPending

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas pt-status-bar">
      <DefenseHeader />
      {/* Figma 사건번호 줄: x 148, y 123. Figma처럼 왼쪽 위치 기준으로 둔다(402px 화면에서 가운데). */}
      <p className="mt-3.25 h-3.5 shrink-0 pl-37 text-xs leading-auto text-black">
        {caseQuery.data?.case_number ? `사건번호 #${caseQuery.data.case_number}` : ''}
      </p>
      <div
        className={`flex min-h-0 flex-1 flex-col ${isSuggestionsOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}
      >
        {renderMessages()}
      </div>
      {isWorking && (
        // TODO(피그마 확인 필요): 보기를 고른 뒤 AI 응답을 기다리는 동안의 디자인이 없다.
        <p role="status" className="shrink-0 pb-2 text-center text-xs text-muted">
          변호인이 답을 정리하고 있어요…
        </p>
      )}
      {submitError && (
        <p role="alert" className="shrink-0 pb-2 text-center text-sm text-danger">
          {submitError}
        </p>
      )}
      {/* 패널이 열려 있는 동안 입력 영역은 보이지 않는다(Figma). 쓰던 답이 지워지지 않도록 숨기기만 한다. */}
      <div hidden={isSuggestionsOpen} className="shrink-0">
        <DefenseComposer
          onSubmit={handleSubmit}
          isSubmitting={isWorking}
          onOpenSuggestions={() => setIsSuggestionsOpen(true)}
          suggestionsId={suggestionsId}
          suggestionsButtonRef={suggestionsButtonRef}
        />
      </div>
      {isSuggestionsOpen && (
        <DefenseSuggestions
          id={suggestionsId}
          onSelect={handleSuggestion}
          onClose={() => setIsSuggestionsOpen(false)}
          // TODO(피그마 확인 필요): 답할 질문이 없을 때(질문 3개 모두 처리) 보기 상태 디자인이 없어 모두 비활성화한다.
          disabled={{
            simplify: !canSimplify(openQuestion),
            not_sure: !openQuestion,
            skip: !openQuestion,
          }}
        />
      )}
    </div>
  )
}
