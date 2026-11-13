/**
 * 하늘색 추천 카드 ("RECOMMENDED FOR YOU ★" / 큰 제목 / 설명). 누를 수 없는 안내다.
 * Figma: x 16~386, y 185~284 (370×99), 그림자 없음. ★는 아이콘이 아니라 글자다.
 * TODO(API 확인 필요): 판결 응답의 `decision.next_action`과 연결할지 정해지면 내용을 바꾼다.
 *
 * @param {object} props
 * @param {{ title: string, description: string }} props.action 추천 행동
 */
export const RecommendedAction = ({ action }) => (
  <section aria-label="추천 행동" className="relative mx-4 h-24.75 rounded-field bg-sky text-ink">
    <p className="absolute top-[14.83px] left-4 text-xs leading-[normal]">RECOMMENDED FOR YOU ★</p>
    <p className="absolute top-[37.64px] left-[16.16px] text-xl leading-[normal] font-semibold">
      {action.title}
    </p>
    <p className="absolute top-[70.84px] left-[16.03px] text-xs leading-[normal]">
      {action.description}
    </p>
  </section>
)
