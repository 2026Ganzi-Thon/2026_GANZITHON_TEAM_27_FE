import chargedTitleUrl from '@/assets/prosecution/charged-title.svg'

/**
 * 기소 화면 상단 안내 (Figma y 110~159). "YOU'RE CHARGED!!" 타이틀 그래픽과 안내 문구를 보여준다.
 * 경찰 마스코트는 사건 배너와 겹쳐 놓이므로 ProsecutionCaseBanner에서 그린다.
 */
export const ProsecutionHero = () => (
  <section>
    <img src={chargedTitleUrl} alt="YOU'RE CHARGED!!" width={243} height={26} className="block" />
    <p className="mt-1.5 h-4.25 text-sm leading-auto text-ink">
      이번 사건의 유형과 기소 근거를 확인해 보세요.
    </p>
  </section>
)
