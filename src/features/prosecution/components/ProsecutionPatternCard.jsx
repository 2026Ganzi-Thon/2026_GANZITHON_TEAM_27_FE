import patternTagBadgeUrl from '@/assets/prosecution/pattern-tag-badge.svg'

/**
 * 사건 유형 카드 (Figma y 479~567). 생각에 담긴 사고 패턴을 태그로 보여준다.
 *
 * @param {object} props
 * @param {string[]} props.patterns 화면에 보여줄 사고 패턴 이름 (예: ['흑백 논리', '낙인 찍기'])
 */
export const ProsecutionPatternCard = ({ patterns }) => (
  <article className="mt-pattern-card-gap min-h-pattern-card-h rounded-field border border-ink bg-ink px-3.75 pt-pattern-card-pt pb-2.75">
    <h3 className="relative flex items-start">
      <img
        src={patternTagBadgeUrl}
        alt=""
        width={78.4251}
        height={26.2762}
        className="max-w-none"
      />
      <span className="absolute inset-y-0 left-2.25 flex items-center pt-px text-base leading-auto font-semibold text-canvas">
        사건 유형
      </span>
    </h3>

    {patterns.length > 0 ? (
      <ul className="mt-pattern-tags-gap flex flex-wrap gap-3.25">
        {patterns.map((pattern) => (
          <li
            key={pattern}
            className="flex h-pattern-tag-h min-w-pattern-tag-w items-center justify-center rounded-full bg-field px-5 pt-2 pb-1.75 text-xs leading-none text-ink"
          >
            {pattern}
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-pattern-tags-gap text-xs leading-auto text-field">
        찾은 사고 패턴이 없어요.
      </p>
    )}
  </article>
)
