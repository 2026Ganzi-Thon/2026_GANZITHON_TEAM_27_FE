/**
 * 기소 요지 카드 (Figma y 362~464). 피고인이 어떤 생각으로 기소되었는지 보여준다.
 *
 * @param {object} props
 * @param {string} props.claim 기소 문구. 줄바꿈(\n)과 공백을 그대로 표시한다.
 */
export const ProsecutionChargeCard = ({ claim }) => (
  <article className="mt-5.75 min-h-25.5 rounded-field bg-field pt-3 pr-4.5 pb-3 pl-4.25">
    <h3 className="flex h-7 w-charge-pill-w items-center justify-center rounded-full bg-ink text-base leading-auto font-semibold text-field">
      기소
    </h3>
    <p className="mt-2.5 text-sm leading-claim whitespace-pre-wrap text-ink">{claim}</p>
  </article>
)
