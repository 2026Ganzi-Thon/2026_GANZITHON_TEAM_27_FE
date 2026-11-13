import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import chevronDownUrl from '@/assets/defense/chevron-down.svg'
import sendButtonUrl from '@/assets/defense/send-button.svg'
import { MAX_ANSWER_LENGTH } from '../utils'

/**
 * 변론 화면 아래쪽 입력 영역 (Figma y 740~828).
 * "추천 질문" 칩, 답변 입력창, 전송 버튼으로 이루어진다.
 *
 * @param {object} props
 * @param {(text: string) => void} props.onSubmit 앞뒤 공백을 지운 답변을 받는 핸들러
 * @param {boolean} [props.isSubmitting] 답변을 보내는 중인지 여부
 * @param {() => void} [props.onOpenSuggestions] "추천 질문" 칩을 누르면 호출한다 (추천 질문 패널 열기)
 * @param {string} [props.suggestionsId] 추천 질문 패널 id (aria-controls)
 * @param {import('react').Ref<HTMLButtonElement>} [props.suggestionsButtonRef] 패널을 닫은 뒤 포커스를 돌려줄 칩 ref
 * @param {string} props.finishTo "변론 종료"를 누르면 이동할 판결 화면 주소
 * @param {boolean} [props.canFinish] "변론 종료"를 누를 수 있는지 (질문을 1개 이상 처리했고 미응답 질문이 없을 때)
 */
export const DefenseComposer = ({
  onSubmit,
  isSubmitting = false,
  onOpenSuggestions,
  suggestionsId,
  suggestionsButtonRef,
  finishTo,
  canFinish = false,
}) => {
  const [text, setText] = useState('')
  const finishHintId = useId()

  /** 빈 답은 보내지 않는다. 보내면 입력창을 비운다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSubmitting) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="shrink-0 pb-6">
      <div className="ml-3.25 flex items-center gap-2.5">
        {/* 누르면 추천 질문 패널(Figma `추천질문`)이 열린다. 패널이 열려 있는 동안 이 입력 영역은 숨겨진다. */}
        <button
          ref={suggestionsButtonRef}
          type="button"
          onClick={onOpenSuggestions}
          aria-expanded={false}
          aria-controls={suggestionsId}
          className="relative flex h-6 w-20.5 items-center rounded-full bg-chip pl-2.75 text-xs leading-auto font-medium text-chip-text"
        >
          추천 질문
          <img
            src={chevronDownUrl}
            alt=""
            width={14}
            height={14}
            className="absolute top-1.25 left-14.75"
          />
        </button>

        {/* TODO(피그마 확인 필요: 변론 종료 버튼) Figma에 없는 버튼이다. 명세 §6.3의 "판결 받기" 역할(변론 → 판결 출구)이다.
            모양은 "추천 질문" 칩과 같은 높이·글자·둥글기·여백으로, 색은 하늘색(sky) 배경에 ink 글자로 두었다.
            누를 수 없을 때도 초점이 가고 이유를 읽어 주도록 disabled 대신 aria-disabled와 설명을 쓴다. */}
        <Link
          to={finishTo}
          aria-disabled={!canFinish}
          aria-describedby={canFinish ? undefined : finishHintId}
          onClick={(event) => {
            if (!canFinish) event.preventDefault()
          }}
          className="flex h-6 items-center rounded-full bg-sky px-2.75 text-xs leading-auto font-medium text-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        >
          변론 종료
        </Link>
        {!canFinish && (
          <span id={finishHintId} className="sr-only">
            질문에 하나 이상 답하고, 답하지 않은 질문이 없을 때 누를 수 있어요.
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative mt-2.5 mr-2.75 ml-3.25 flex h-13.5 items-center rounded-full bg-field focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus"
      >
        <label htmlFor="defense-answer" className="sr-only">
          답변
        </label>
        <input
          id="defense-answer"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="답변을 입력해주세요."
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent pr-14 pl-6.25 text-xs leading-auto text-black placeholder:text-black outline-none pt-0.5"
        />
        {/* 아이콘 중심: Figma (349.5, 801.5), 입력창 오른쪽 끝에서 32.5px */}
        <button
          type="submit"
          aria-label="답변 보내기"
          disabled={isSubmitting}
          className="absolute top-1.25 right-2.5 flex size-11.25 items-center justify-center rounded-full disabled:opacity-60"
        >
          {/* 오른쪽 화살표 원본을 Figma처럼 -90° 돌려 위쪽 화살표로 쓴다. */}
          <img src={sendButtonUrl} alt="" width={27} height={27} className="-rotate-90" />
        </button>
      </form>
    </div>
  )
}
