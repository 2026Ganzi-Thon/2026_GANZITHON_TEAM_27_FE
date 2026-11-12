import rephraseIconUrl from '@/assets/decision/rephrase-icon.svg'
// 기소 화면의 연필 아이콘과 같은 모양이다(11px로 그렸을 때 렌더 비교 차이 0%).
import editIconUrl from '@/assets/prosecution/edit-icon.svg'
import { MAX_STATEMENT_LENGTH } from '../utils'

/**
 * 카드 안 작은 버튼 (Figma 165×29, r5). 보이는 크기는 Figma 그대로 두고,
 * 클릭 영역만 위아래로 8px씩 넓혀 44px 이상이 되게 한다.
 */
const CARD_BUTTON_CLASS =
  'relative h-7.25 w-41.25 rounded-field bg-canvas before:absolute before:inset-x-0 before:-inset-y-2 disabled:opacity-60'

/**
 * 수정된 생각(최종 진술문) 카드 (Figma `2-5 최종 진술문`, x 18, y 538, 367×125).
 * 연필 버튼으로 문장을 직접 고치고, 회전 버튼으로 다른 표현을 받는다.
 *
 * @param {object} props
 * @param {string} props.statement 지금 보여줄 진술문
 * @param {boolean} props.isEditing 직접 수정 중인지 여부
 * @param {(value: string) => void} props.onChange 직접 수정 입력 핸들러
 * @param {() => void} props.onEditToggle 연필 버튼 핸들러 (수정 시작/끝)
 * @param {() => void} props.onRephrase 회전 버튼 핸들러 (다른 표현 요청)
 * @param {boolean} [props.isRephrasing] 다른 표현을 받는 중인지 여부
 * @param {string | null} [props.errorMessage] 입력 검사·재표현 오류 문구
 */
export const DecisionStatementCard = ({
  statement,
  isEditing,
  onChange,
  onEditToggle,
  onRephrase,
  isRephrasing = false,
  errorMessage = null,
}) => (
  <article className="mt-2.75 -mr-px ml-px min-h-31.25 rounded-field bg-evidence pt-5.25 pr-3.5 pb-4 pl-4 text-ink">
    <h3 className="h-4.75 text-base leading-auto font-semibold">수정된 생각</h3>

    {isEditing ? (
      // TODO(피그마 확인 필요): 직접 수정 모드 디자인이 없어 같은 글자 크기의 입력창만 둔다.
      <textarea
        aria-label="수정된 생각 직접 수정"
        value={statement}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_STATEMENT_LENGTH}
        rows={2}
        className="mt-1.5 block w-full resize-none rounded-field bg-canvas px-2 py-1 text-xs leading-claim"
      />
    ) : (
      <p className="mt-1.5 text-xs leading-claim whitespace-pre-wrap">{statement}</p>
    )}

    {errorMessage && (
      <p role="alert" className="mt-1 text-xs text-danger">
        {errorMessage}
      </p>
    )}

    {/* Figma 버튼: x 30·206, y 618 (카드 왼쪽에서 12px, 버튼 사이 11px).
        본문 줄 높이가 16.8px이라 본문 끝(600.8)에서 17.2px 띄워야 y 618에 맞는다. */}
    <div className="mt-[17.2px] -ml-1 flex gap-2.75">
      <button
        type="button"
        onClick={onEditToggle}
        aria-label={isEditing ? '직접 수정 끝내기' : '수정된 생각 직접 수정'}
        aria-pressed={isEditing}
        className={CARD_BUTTON_CLASS}
      >
        {/* Figma 아이콘: x 107, y 625, 11×11 (버튼 가운데, 위에서 7px) */}
        <img
          src={editIconUrl}
          alt=""
          width={11}
          height={11}
          className="absolute top-1.75 left-19.25 max-w-none"
        />
      </button>
      <button
        type="button"
        onClick={onRephrase}
        disabled={isRephrasing || isEditing}
        aria-busy={isRephrasing}
        aria-label={isRephrasing ? '다른 표현을 받는 중' : '다른 표현으로 바꾸기'}
        className={CARD_BUTTON_CLASS}
      >
        {/* Figma 아이콘: x 284, y 625.87, 15×12 */}
        <img
          src={rephraseIconUrl}
          alt=""
          width={15}
          height={12}
          className="absolute top-[7.87px] left-19.5 max-w-none"
        />
      </button>
    </div>
  </article>
)
