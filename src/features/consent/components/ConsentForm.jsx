import { useState } from 'react'
import ringUrl from '@/assets/consent-check-ring.svg'

/**
 * 동의 폼. 필수 항목에 동의해야 "다음" 버튼이 활성화된다.
 * @param {object} props
 * @param {() => void} props.onNext 동의 후 "다음"을 눌렀을 때 호출하는 핸들러
 */
export const ConsentForm = ({ onNext }) => {
  const [agreed, setAgreed] = useState(false)

  /** 동의한 경우에만 다음 단계로 넘긴다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    if (agreed) onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="mt-47 flex h-field items-center rounded-field bg-field pl-6.25">
        <label className="flex flex-1 cursor-pointer items-center gap-3.75 text-base font-semibold text-ink">
          <span className="relative size-6.5 shrink-0 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
            <img src={ringUrl} alt="" width={26} height={26} className="absolute inset-0" />
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full checked:bg-ink focus-visible:outline-none"
            />
          </span>
          (필수) 개인정보 수집 이용동의
        </label>
        {/* TODO(기획 확인 필요): "자세히"가 열 내용(모달 또는 화면)이 정해지면 연결한다. */}
        <button type="button" className="mr-7.5 min-h-11 min-w-11 text-xs text-ink">
          자세히
        </button>
      </div>

      <div className="mt-auto pb-9.75">
        <button
          type="submit"
          disabled={!agreed}
          className="h-button w-full rounded-full bg-ink text-base font-semibold text-field disabled:opacity-60"
        >
          다음
        </button>
      </div>
    </form>
  )
}
