import emotionCheckTitleUrl from '@/assets/emotion/emotion-check-title.svg'

/**
 * 감정 변화 화면 상단 안내 (Figma x 16, y 110~157). "EMOTION CHECK" 타이틀 그래픽과 안내 문구를 보여준다.
 * 이 화면의 안내 문구는 다른 화면(14px)과 달리 12px이다.
 */
export const EmotionHero = () => (
  <section className="pl-4">
    <img
      src={emotionCheckTitleUrl}
      alt="EMOTION CHECK"
      width={243}
      height={27}
      className="block max-w-none"
    />
    <p className="mt-1.5 h-3.5 text-xs leading-[normal] text-ink">지금 감정 상태를 체크해주세요.</p>
  </section>
)
