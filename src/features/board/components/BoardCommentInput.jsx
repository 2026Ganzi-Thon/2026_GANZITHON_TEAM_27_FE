import { useState } from 'react'
import iconSendUrl from '@/assets/board/icon-send.svg'

/**
 * 하단 댓글 입력 바.
 * 텍스트 입력 필드와 전송 버튼을 제공하며, 화면 하단에 고정된다.
 *
 * @param {object} props
 * @param {(content: string) => void} props.onSubmit 댓글 등록 핸들러
 * @param {boolean} [props.isSubmitting] 등록 진행 중 여부
 */
export const BoardCommentInput = ({ onSubmit, isSubmitting = false }) => {
  const [content, setContent] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!content.trim() || isSubmitting) return
    onSubmit(content.trim())
    setContent('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-20 flex w-full items-center gap-2.5 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pt-2 pb-6"
    >
      <div className="flex h-[58px] flex-1 items-center rounded-[5px] bg-field px-4">
        <input
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="댓글을 입력해주세요..."
          disabled={isSubmitting}
          className="w-full bg-transparent text-xs text-black placeholder:text-black focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        aria-label="댓글 전송"
        className="flex size-[58px] shrink-0 items-center justify-center rounded-[5px] bg-field transition-transform active:scale-95 disabled:opacity-50 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-focus"
      >
        <img src={iconSendUrl} alt="" width={34} height={34} />
      </button>
    </form>
  )
}
