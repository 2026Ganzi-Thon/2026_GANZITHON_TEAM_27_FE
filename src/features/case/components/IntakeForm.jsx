import { useRef, useState } from 'react'
import titleUrl from '@/assets/intake/intake-title.svg'
import { EMOTIONS, EMOTION_INTENSITY_RANGE } from '@/constants/emotions'
import { useCreateCase } from '../hooks/useCreateCase'
import { EmotionPicker } from './EmotionPicker'
import { IntensitySlider } from './IntensitySlider'

/**
 * 생각 입력 글자 수 제한.
 * TODO(API 확인 필요): 디자인은 300자, API 명세는 1~2,000자다. 어느 쪽이 맞는지 확인한다.
 */
const THOUGHT_MAX_LENGTH = 300

/**
 * 사건 접수 폼. 생각을 적고 감정과 강도를 고른 뒤 "다음"을 누르면 사건파일을 만든다.
 *
 * - 같은 제출을 다시 시도할 때는 같은 Idempotency-Key를 쓰고, 입력이 바뀌거나 성공하면 새로 만든다.
 * - 실패해도 작성한 내용은 지우지 않는다.
 * - 위기 상황(`support_required`)이면 사건을 만들지 않고 상담 안내를 보여준다.
 *   TODO(피그마 확인 필요): 위기 안내(5-1) 화면이 나오면 그 화면으로 이동하도록 바꾼다.
 *
 * @param {{ onCreated: (createdCase: object) => void }} props
 * - `onCreated`: 사건파일이 만들어지면 그 사건과 함께 호출한다
 */
export const IntakeForm = ({ onCreated }) => {
  const [thought, setThought] = useState('')
  const [emotionKey, setEmotionKey] = useState(null)
  const [intensity, setIntensity] = useState(EMOTION_INTENSITY_RANGE.default)
  const idempotencyKeyRef = useRef(crypto.randomUUID())
  const { mutate, isPending, isError, data } = useCreateCase()

  const trimmed = thought.trim()
  const canSubmit = trimmed.length > 0 && !isPending
  const support = data?.outcome === 'support_required' ? data.support : null

  /** 입력이 바뀌면 이전 제출과 다른 요청이므로 Idempotency-Key를 새로 만든다. */
  const changeInput = (setter) => (value) => {
    idempotencyKeyRef.current = crypto.randomUUID()
    setter(value)
  }

  /** 사건 접수 요청을 보낸다. 성공하면 새 Idempotency-Key를 만들고 `onCreated`를 호출한다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    const emotion = EMOTIONS.find((item) => item.key === emotionKey)
    mutate(
      {
        thought: trimmed,
        // API 규칙: 감정 type과 강도는 둘 다 보내거나 둘 다 생략한다.
        emotion: emotion ? { type: emotion.apiType, intensity } : undefined,
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: (result) => {
          if (result.outcome !== 'created') return
          idempotencyKeyRef.current = crypto.randomUUID()
          onCreated(result.case)
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
      <img
        src={titleUrl}
        alt="WHAT'S THE CHARGE?!!"
        width={306}
        height={25}
        className="mt-6.5 ml-4.25"
      />
      <label htmlFor="thought" className="mt-1.5 ml-4.75 text-sm text-ink">
        오늘 마음에 걸렸던 일을 자유롭게 적어주세요.
      </label>

      <div className="relative mx-4.5 mt-7 h-108.25 rounded-[10px] bg-sky">
        <textarea
          id="thought"
          value={thought}
          maxLength={THOUGHT_MAX_LENGTH}
          onChange={(event) => changeInput(setThought)(event.target.value)}
          placeholder="예: 오늘 회의에서 발표를 망쳤어 다들 나를 한심하게 봤을거야."
          aria-describedby="thought-count"
          className="size-full resize-none rounded-[10px] bg-transparent px-5.5 pt-7 pb-10 text-xs text-ink placeholder:text-ink/50"
        />
        <p
          id="thought-count"
          className="pointer-events-none absolute right-5.5 bottom-6 text-xs text-ink"
        >
          {thought.length}/{THOUGHT_MAX_LENGTH}
        </p>
      </div>

      <h2 className="mt-8.25 ml-6 text-base font-semibold text-ink">지금 어떤 감정인가요</h2>
      <div className="mx-4.5">
        <EmotionPicker value={emotionKey} onChange={changeInput(setEmotionKey)} />
      </div>

      <h2 className="mt-7.75 ml-4 text-base font-semibold text-ink">감정의 강도는 어떤가요</h2>
      <div className="mx-4">
        <IntensitySlider
          disabled={!emotionKey}
          value={intensity}
          onChange={changeInput(setIntensity)}
        />
      </div>

      {support && (
        <div role="alert" className="mx-4 mt-6 rounded-[10px] bg-field px-4 py-3 text-sm text-ink">
          <p>{support.message}</p>
          <ul className="mt-2 font-semibold">
            {support.contacts.map((contact) => (
              <li key={contact}>{contact}</li>
            ))}
          </ul>
        </div>
      )}
      {isError && (
        <p role="alert" className="mx-4 mt-6 text-sm text-danger">
          접수하지 못했어요. 작성한 내용은 그대로 있으니 다시 눌러 주세요.
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mx-4.5 mt-16.75 mb-16 h-button shrink-0 rounded-[41px] bg-ink text-base font-semibold text-white disabled:opacity-40"
      >
        {isPending ? '접수 중…' : '다음'}
      </button>
    </form>
  )
}
