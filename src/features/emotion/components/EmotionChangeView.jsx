import { useState } from 'react'
import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'
import { EmotionHeader } from './EmotionHeader'
import { EmotionHero } from './EmotionHero'
import { EmotionIntensity } from './EmotionIntensity'
import { EmotionNextButton } from './EmotionNextButton'

/**
 * 감정 변화 화면 본문 (Figma `2-6 감정변화`, 402×874).
 * 접수 당시 강도를 보여주고, 지금 감정 강도를 슬라이더로 고른다.
 * 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 * 접수 당시 감정은 화면 입구(페이지)가 사건 상세에서 읽어 `intake`로 넘겨준다.
 *
 * @param {object} props
 * @param {{status: 'loading' | 'error' | 'ready', emotion?: {type: string, intensity: number} | null, onRetry?: () => void}} props.intake
 *   접수 당시 감정. `emotion`이 null이면 접수 때 감정을 입력하지 않은 것이다("기록 없음")
 * @param {(emotionAfter: {type: string | null, intensity: number}) => void} props.onNext
 *   "다음"을 누르면 지금 감정(종결 시점 감정)과 함께 호출한다
 * @param {boolean} [props.isSubmitting] 다음 단계로 넘어가는 요청(판결 확정) 중인지. 이때 "다음"을 누를 수 없다.
 * @param {string | null} [props.errorMessage] 요청에 실패했을 때 보여줄 문구
 */
export const EmotionChangeView = ({
  intake,
  onNext,
  isSubmitting = false,
  errorMessage = null,
}) => {
  // Figma 초기값 40 (constants/emotions.js의 기본값과 같다). 접수 당시 값에 맞추지 않고 지금 감정을 새로 고르게 둔다.
  const [intensity, setIntensity] = useState(EMOTION_INTENSITY_RANGE.default)

  /** 지금 감정을 넘긴다. 감정 type은 접수 때 type을 그대로 쓴다. */
  const handleNext = () => {
    if (isSubmitting) return
    // TODO(피그마 확인 필요): 이 화면에 감정 종류 선택 UI가 없어 접수 때 type을 그대로 쓴다.
    // (docs/api-spec.md §6.5: 접수·종결에 같은 type일 때만 강도를 비교한다)
    onNext({ type: intake.emotion?.type ?? null, intensity })
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-11">
      <EmotionHeader />
      <EmotionHero />
      <EmotionIntensity
        value={intensity}
        onChange={setIntensity}
        intake={{
          status: intake.status,
          intensity: intake.emotion?.intensity ?? null,
          onRetry: intake.onRetry,
        }}
      />
      {errorMessage && (
        // TODO(피그마 확인 필요): 판결 확정 실패 디자인이 없다.
        <p role="alert" className="mx-4.5 mt-4 text-center text-sm text-danger">
          {errorMessage}
        </p>
      )}
      <EmotionNextButton onNext={handleNext} isPending={isSubmitting} />
    </div>
  )
}
