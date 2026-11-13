/** 카드 색상 변형 (Figma: 사실인 부분 = 밝은 카드, 과장된 부분 = 어두운 카드) */
const VARIANTS = {
  light: { card: 'bg-field text-ink', title: '' },
  // Figma 어두운 카드는 제목만 왼쪽으로 1px 더 붙어 있다(제목 x 32, 본문 x 33).
  dark: { card: 'bg-ink text-canvas', title: '-ml-px' },
}

/**
 * 판결 근거 카드 (Figma 367×80). 제목과 문장 목록을 보여준다.
 * 사실인 부분(`reported_facts`)과 과장된 부분(`unsupported_claims`)에 함께 쓴다.
 *
 * @param {object} props
 * @param {string} props.title 카드 제목 (예: '사실인 부분')
 * @param {string[]} props.items 문장 목록
 * @param {'light' | 'dark'} [props.variant] 색상 변형
 */
export const DecisionPointCard = ({ title, items, variant = 'light' }) => {
  const style = VARIANTS[variant]

  return (
    <article className={`mt-2.75 min-h-20 rounded-field pt-4.75 pr-4 pb-4.5 pl-4 ${style.card}`}>
      <h3 className={`h-4.75 text-base leading-auto font-semibold ${style.title}`}>{title}</h3>
      {items.length > 0 ? (
        // TODO(피그마 확인 필요): 문장이 여러 개이거나 길 때의 간격·말줄임 디자인이 없다. 지금은 줄을 이어 쌓는다.
        <ul className="mt-1.5 text-xs leading-claim">
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        // TODO(피그마 확인 필요): 빈 상태 디자인이 없다.
        <p className="mt-1.5 text-xs leading-claim">해당하는 내용이 없어요.</p>
      )}
    </article>
  )
}
