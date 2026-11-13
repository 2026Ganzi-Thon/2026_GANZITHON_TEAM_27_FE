import { DefenseAvatar } from './DefenseAvatar'

/**
 * 변론 대화 말풍선 한 줄.
 *
 * - AI 질문: 왼쪽에 아바타, 하늘색 말풍선(Figma 282×41, 왼쪽 아래 모서리만 각짐)
 * - 내 답: 오른쪽 정렬, 회색 테두리 말풍선(Figma 154×38, 오른쪽 위 모서리만 각짐)
 * 말풍선 크기는 Figma 크기를 최소값으로 두고, 글이 길면 늘어나며 줄바꿈한다.
 *
 * @param {object} props
 * @param {'ai' | 'me'} props.from 보낸 쪽
 * @param {string} props.text 말풍선 문장
 */
export const ChatMessage = ({ from, text }) => {
  if (from === 'ai') {
    return (
      <li className="flex items-start gap-2.25 pl-7.25">
        {/* 아바타(42px)가 말풍선(41px)보다 1px 커서 다음 말풍선이 밀리지 않도록 아래 여백을 1px 줄인다. */}
        <DefenseAvatar className="-mb-px" />
        <p className="min-h-10.25 min-w-70.5 rounded-bubble rounded-bl-none bg-sky pt-3.25 pr-5.25 pb-3 pl-5.25 text-chat leading-auto font-medium break-words text-chat-text">
          {text}
        </p>
      </li>
    )
  }

  return (
    <li className="flex justify-end pr-5.25">
      <p className="min-h-9.5 min-w-38.5 rounded-bubble rounded-tr-none border border-chat-line pt-2.75 pr-7.5 pb-2.25 pl-7.5 text-chat leading-auto font-medium break-words text-chat-text">
        {text}
      </p>
    </li>
  )
}
