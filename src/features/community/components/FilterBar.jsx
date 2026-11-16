import chevronUrl from '@/assets/community/chevron-down.svg'

/** 필터 칩 하나("사건 유형 ⌄" 등). 조건이 걸려 있으면 하늘색으로 보인다. */
const FilterChip = ({ label, active = false, disabled = false, onClick, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-haspopup={onClick ? 'dialog' : undefined}
    aria-label={ariaLabel}
    className={`flex h-6.5 items-center gap-1.25 rounded-[21px] px-2.75 text-xs leading-[normal] text-black ${
      active ? 'bg-sky' : 'bg-[#f0f0f0]'
    }`}
  >
    {label}
    <img src={chevronUrl} alt="" width={8} height={4} />
  </button>
)

/**
 * 게시판 목록 위의 필터 줄. 왼쪽에 "사건 유형", "공개 범위" 버튼이 있고(누르면 시트가 열린다), 오른쪽에 "최신순"이 있다.
 *
 * TODO(피그마 확인 필요): "최신순"을 눌렀을 때 나오는 정렬 선택지가 시안에 없어서 누를 수 없게 두었다.
 *
 * @param {{
 *   patternCount: number,
 *   hasScope: boolean,
 *   onOpenPattern: () => void,
 *   onOpenScope: () => void,
 * }} props
 * - `patternCount`: 고른 사건 유형 개수. 하나라도 있으면 "사건 유형"이 하늘색이 된다
 * - `hasScope`: 공개 범위를 골랐는지
 * - `onOpenPattern`, `onOpenScope`: 각 버튼을 눌렀을 때 시트를 연다
 */
export const FilterBar = ({ patternCount, hasScope, onOpenPattern, onOpenScope }) => (
  <div className="flex items-center justify-between px-4">
    <div className="flex gap-2.5">
      <FilterChip
        label="사건 유형"
        ariaLabel={patternCount > 0 ? `사건 유형, ${patternCount}개 선택됨` : '사건 유형'}
        active={patternCount > 0}
        onClick={onOpenPattern}
      />
      <FilterChip
        label="공개 범위"
        ariaLabel={hasScope ? '공개 범위, 선택됨' : '공개 범위'}
        active={hasScope}
        onClick={onOpenScope}
      />
    </div>
    <FilterChip label="최신순" disabled />
  </div>
)
