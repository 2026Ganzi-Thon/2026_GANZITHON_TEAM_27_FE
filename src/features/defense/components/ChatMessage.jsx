import { DefenseAvatar } from './DefenseAvatar'

const sentenceSegmenter = new Intl.Segmenter('ko', { granularity: 'sentence' })
const PARAGRAPH_TARGET_LENGTH = 100

/** 기존 문단을 유지하고, 긴 문단은 문장 경계에서 나눈다. */
const splitParagraphs = (text) =>
  text
    .trim()
    .split(/\r?\n(?:[^\S\r\n]*\r?\n)+/)
    .flatMap((paragraph) => {
      const chunks = []
      let chunk = ''

      for (const { segment } of sentenceSegmenter.segment(paragraph)) {
        if (chunk.trim().length >= PARAGRAPH_TARGET_LENGTH && segment.trim()) {
          chunks.push(chunk.trim())
          chunk = ''
        }
        chunk += segment
      }

      if (chunk.trim()) chunks.push(chunk.trim())
      return chunks
    })

/**
 * 변론 대화의 AI 질문과 사용자 답변을 말풍선 한 줄로 표시한다.
 * @param {object} props
 * @param {'ai' | 'me'} props.from 보낸 쪽
 * @param {string} props.text 말풍선 내용
 */
export const ChatMessage = ({ from, text }) => {
  const isAi = from === 'ai'
  const rowClass = isAi ? 'items-start gap-2.25 pr-5.25 pl-7.25' : 'justify-end px-5.25'
  const bubbleClass = isAi
    ? 'min-h-10.25 w-70.5 rounded-bl-none bg-sky px-5.25 pt-3.25 pb-3'
    : 'min-h-9.5 max-w-4/5 rounded-tr-none border border-chat-line px-7.5 pt-2.75 pb-2.25'

  return (
    <li className={`flex ${rowClass}`}>
      {isAi && <DefenseAvatar className="-mb-px" />}
      <div
        className={`min-w-0 space-y-2 rounded-bubble text-chat leading-normal font-medium wrap-anywhere whitespace-pre-line text-chat-text ${bubbleClass}`}
      >
        {splitParagraphs(text).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </li>
  )
}
