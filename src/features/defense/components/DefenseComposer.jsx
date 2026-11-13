import { useState } from 'react'
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
 */
export const DefenseComposer = ({ onSubmit, isSubmitting = false }) => {
  const [text, setText] = useState('')

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
      {/* TODO(피그마 확인 필요): 추천 질문을 펼친 상태 디자인이 없다. 디자인이 나오면 목록을 연결한다. */}
      <button
        type="button"
        aria-expanded={false}
        className="relative ml-3.25 flex h-6 w-20.5 items-center rounded-full bg-chip pl-2.75 text-xs leading-auto font-medium text-chip-text"
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
