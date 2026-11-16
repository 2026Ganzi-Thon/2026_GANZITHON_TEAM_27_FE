import timeToJudgeUrl from '@/assets/decision/time-to-judge.svg'

/**
 * 판결 화면 상단 안내 (Figma y 110~158). "TIME TO JUDGE!" 타이틀 그래픽과 안내 문구를 보여준다.
 */
export const DecisionHero = () => (
  <section>
    <img src={timeToJudgeUrl} alt="TIME TO JUDGE!" width={219} height={25} className="block" />
    <p className="mt-1.5 h-4.25 text-sm leading-auto text-ink">최종 판결을 확인해보세요.</p>
  </section>
)
