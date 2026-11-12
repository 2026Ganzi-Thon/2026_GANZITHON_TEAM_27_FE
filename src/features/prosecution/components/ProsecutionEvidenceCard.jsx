import editIconUrl from '@/assets/prosecution/edit-icon.svg'

/**
 * 검사 측 증거 카드 (Figma y 586~670). 기소의 근거가 된 사실이나 경험 목록을 보여준다.
 *
 * @param {object} props
 * @param {Array<{type?: string, text: string}>} props.evidence 증거 목록
 * @param {() => void} [props.onEdit] 증거 수정 버튼 핸들러. 없으면 버튼을 숨긴다.
 */
export const ProsecutionEvidenceCard = ({ evidence, onEdit }) => (
  <article className="relative mt-4.75 min-h-21 rounded-field bg-evidence pt-evidence-pill-top pr-4 pb-3 pl-4">
    <h3 className="flex h-evidence-pill-h w-evidence-pill-w items-center rounded-full bg-ink pl-3.25 text-base leading-auto font-semibold text-field">
      검사 측 증거
    </h3>
    {onEdit && (
      // 아이콘 중심: Figma (360.4, 613.8)
      <button
        type="button"
        onClick={onEdit}
        aria-label="증거 수정"
        className="absolute top-1.5 right-1 flex size-11 items-center justify-center"
      >
        <img src={editIconUrl} alt="" width={15.4123} height={15.4123} />
      </button>
    )}

    {evidence.length > 0 ? (
      <ul className="mt-2.5 -ml-1.25 flex list-disc flex-wrap gap-x-2.5 text-sm leading-auto text-ink">
        {evidence.map((item, index) => (
          <li key={`${index}-${item.text}`} className="ml-5.25 list-item">
            {item.text}
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-2.5 text-sm leading-auto text-ink">아직 정리된 증거가 없어요.</p>
    )}
  </article>
)
