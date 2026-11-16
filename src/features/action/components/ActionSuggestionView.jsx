import { useState } from 'react'
import titleUrl from '@/assets/action/action-title.svg'
import { useFollowUp } from '../hooks/useFollowUp'
import {
  MOCK_ACTION_OPTIONS,
  MOCK_DEFAULT_OPTION_ID,
  MOCK_RECOMMENDED_ACTION,
} from '../mocks/actionMocks'
import { buildFollowUpBody, FOLLOW_UP_CHOICE, isSupportRequired } from '../utils'
import { ActionHeader } from './ActionHeader'
import { ActionOptionGroup } from './ActionOptionGroup'
import { RecommendedAction } from './RecommendedAction'

const BUTTON_BASE =
  'flex h-action-button shrink-0 items-center justify-center rounded-field leading-[normal] disabled:opacity-60'

/**
 * 행동 제안 화면 (Figma `2-7 행동제안` 1:1132, 402×874).
 *
 * - 카드 4개 중 하나를 고른다(처음엔 Figma처럼 카드 2 선택).
 * - "LET’S DO IT": 고른 카드의 설명을 `action_text`로 `PUT /cases/{id}/follow-up { choice: "action" }`
 * - "오늘은 쉬기": `PUT /cases/{id}/follow-up { choice: "rest" }`
 * - 저장되면 `onDone`, 위기 안내로 바뀌면 `onSupportRequired`를 부른다. 실패하면 고른 카드는 그대로 두고 오류를 알린다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 * @param {() => void} props.onBack 뒤로 가기
 * @param {string} props.homeTo 홈 아이콘 주소
 * @param {(choice: 'action' | 'rest') => void} props.onDone 저장이 끝나면 호출한다
 * @param {() => void} props.onSupportRequired 응답이 `support_required`이면 호출한다(응답 내용은 넘기지 않는다)
 */
export const ActionSuggestionView = ({ caseId, onBack, homeTo, onDone, onSupportRequired }) => {
  const [selectedId, setSelectedId] = useState(MOCK_DEFAULT_OPTION_ID)
  const followUp = useFollowUp()
  // 저장에 성공해 다음 화면으로 넘어가는 중이면 버튼·카드를 다시 누를 수 없게 한다.
  const [isLeaving, setIsLeaving] = useState(false)
  const isBusy = followUp.isPending || isLeaving
  const selected = MOCK_ACTION_OPTIONS.find((option) => option.id === selectedId)

  /** 고른 동작을 저장하고 결과에 따라 다음 화면으로 넘긴다. */
  const submit = async (choice) => {
    if (isBusy) return
    const body = buildFollowUpBody(choice, selected?.description)
    try {
      const response = await followUp.mutateAsync({ caseId, body })
      setIsLeaving(true)
      if (isSupportRequired(response)) {
        // 위기 안내로 바뀌면 보낸 내용이 남지 않도록 요청 기록을 지우고 법정 흐름을 멈춘다.
        followUp.reset()
        onSupportRequired()
        return
      }
      onDone(choice)
    } catch {
      // 오류는 followUp.isError로 화면에 알린다. 고른 카드는 그대로 둔다.
    }
  }

  return (
    <section className="flex min-h-full flex-1 flex-col bg-canvas pt-11">
      <ActionHeader onBack={onBack} homeTo={homeTo} />

      {/* 레터링 "YOUR NEXTMOVE." (Figma 내보낸 SVG, x 18, y 110, 247×27) */}
      <h1 className="ml-4.5 self-start">
        <img src={titleUrl} alt="YOUR NEXTMOVE." width={247} height={27} className="block" />
      </h1>
      <p className="mt-[5.5px] ml-4.5 text-xs leading-[normal] text-ink">
        작은 행동 하나로 오늘을 마무리해 보세요.
      </p>

      <div className="mt-[28.51px]">
        <RecommendedAction action={MOCK_RECOMMENDED_ACTION} />
      </div>

      <div className="mt-[29.74px]">
        <ActionOptionGroup
          options={MOCK_ACTION_OPTIONS}
          value={selectedId}
          onChange={setSelectedId}
          disabled={isBusy}
        />
      </div>

      {followUp.isError && (
        // TODO(문구 확인 필요): Figma에 저장 실패 상태가 없어 임시 문구를 쓴다.
        <p role="alert" className="mx-4 mt-4 text-sm text-danger">
          저장하지 못했어요. 고른 내용은 그대로 있으니 다시 눌러 주세요.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-6 pb-9.5" aria-busy={isBusy}>
        {/* Figma: LET’S DO IT x 15, w 371 / 오늘은 쉬기 x 16, w 370, 높이 58 */}
        <button
          type="button"
          onClick={() => submit(FOLLOW_UP_CHOICE.action)}
          disabled={isBusy || !selected}
          className={`${BUTTON_BASE} mr-4 ml-3.75 bg-ink pb-[1.33px] pl-[1.67px] text-base font-semibold text-white`}
        >
          LET’S DO IT
        </button>
        <button
          type="button"
          onClick={() => submit(FOLLOW_UP_CHOICE.rest)}
          disabled={isBusy}
          className={`${BUTTON_BASE} mx-4 bg-field pb-1.5 text-sm text-ink`}
        >
          오늘은 쉬기
        </button>
      </div>
    </section>
  )
}
