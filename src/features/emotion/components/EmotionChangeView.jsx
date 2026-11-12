import { useState } from 'react'
import { EMOTION_INTENSITY_RANGE } from '@/constants/emotions'
import { useCaseEmotion } from '../hooks/useEmotion'
import { EmotionHeader } from './EmotionHeader'
import { EmotionHero } from './EmotionHero'
import { EmotionIntensity } from './EmotionIntensity'
import { EmotionNextButton } from './EmotionNextButton'

/**
 * 감정 변화 화면 본문 (Figma `2-6 감정변화`, 402×874).
 * 접수 당시 강도를 보여주고, 지금 감정 강도를 슬라이더로 고른다.
 * 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 * @param {(emotionAfter: {type: string | null, intensity: number}) => void} props.onNext
 *   "다음"을 누르면 지금 감정(종결 시점 감정)과 함께 호출한다
 */
export const EmotionChangeView = ({ caseId, onNext }) => {
  const caseQuery = useCaseEmotion(caseId)
  // Figma 초기값 40 (constants/emotions.js의 기본값과 같다)
  const [intensity, setIntensity] = useState(EMOTION_INTENSITY_RANGE.default)

  const intake = caseQuery.isPending
    ? { status: 'loading' }
    : caseQuery.isError
      ? { status: 'error', onRetry: () => caseQuery.refetch() }
      : { status: 'ready', intensity: caseQuery.data?.emotion?.intensity ?? null }

  /** 지금 감정을 넘긴다. 감정 type은 접수 때와 같다고 가정한다. */
  const handleNext = () => {
    // TODO(피그마 확인 필요): 이 화면에 감정 종류 선택 UI가 없어 접수 때 type을 그대로 쓴다.
    // (docs/api-spec.md §6.5: 접수·종결에 같은 type일 때만 강도를 비교한다)
    onNext({ type: caseQuery.data?.emotion?.type ?? null, intensity })
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-11">
      <EmotionHeader />
      <EmotionHero />
      <EmotionIntensity value={intensity} onChange={setIntensity} intake={intake} />
      <EmotionNextButton onNext={handleNext} />
    </div>
  )
}
