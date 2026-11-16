import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { POST_SCOPE } from '../api/listPosts'
import { PATTERN_OPTIONS } from '../patternOptions'
import { ChipOption } from './ChipOption'

/** 시트 아래의 "초기화"(회색)와 "보기"(검정) 버튼. */
const SheetButtons = ({ applyLabel, onReset, onApply }) => (
  <div className="mt-4.75 grid grid-cols-[139px_1fr] gap-3.5 px-4.5">
    <button
      type="button"
      onClick={onReset}
      className="h-button rounded-[41px] bg-field text-base leading-[normal] font-semibold text-ink"
    >
      초기화
    </button>
    <button
      type="button"
      onClick={onApply}
      className="h-button rounded-[41px] bg-ink text-base leading-[normal] font-semibold text-white"
    >
      {applyLabel}
    </button>
  </div>
)

/**
 * "사건 유형" 선택 시트. 여러 개를 고를 수 있고, "사건 유형 보기"를 눌러야 목록에 적용된다.
 * 시트를 닫았다 열면 마지막으로 적용한 값에서 다시 시작한다(시트가 열릴 때마다 새로 만들어진다).
 *
 * @param {{ selected: string[], onApply: (keys: string[]) => void, onClose: () => void }} props
 * - `selected`: 지금 적용된 사건 유형 `key` 목록
 * - `onApply`: "사건 유형 보기"를 누르면 고른 `key` 목록과 함께 호출한다
 * - `onClose`: 시트를 닫는다
 */
export const PatternSheet = ({ selected, onApply, onClose }) => {
  const [draft, setDraft] = useState(selected)

  /** 칩을 누르면 고른 목록에 넣거나 뺀다. */
  const toggle = (key) =>
    setDraft((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )

  return (
    <BottomSheet open title="사건 유형" onClose={onClose}>
      <div className="mx-4 mt-2 flex flex-wrap gap-x-6 gap-y-3.25 rounded-[20px] border border-[#d9d9d9] px-3 py-3.5">
        {PATTERN_OPTIONS.map((pattern) => (
          <ChipOption
            key={pattern.key}
            label={pattern.label}
            selected={draft.includes(pattern.key)}
            onToggle={() => toggle(pattern.key)}
          />
        ))}
      </div>
      <SheetButtons
        applyLabel="사건 유형 보기"
        onReset={() => setDraft([])}
        onApply={() => onApply(draft)}
      />
    </BottomSheet>
  )
}

/** 공개 범위 선택지. 순서는 시트의 왼쪽부터다. */
const SCOPE_OPTIONS = [
  { value: POST_SCOPE.mine, label: '내 글만 보기' },
  { value: POST_SCOPE.all, label: '모든 글 보기' },
]

/**
 * "공개 범위" 선택 시트. "내 글만 보기"와 "모든 글 보기" 중 하나만 고를 수 있고, "공개 범위 보기"를 눌러야 적용된다.
 *
 * @param {{ selected: 'mine' | 'all' | null, onApply: (scope: 'mine' | 'all' | null) => void, onClose: () => void }} props
 * - `selected`: 지금 적용된 공개 범위. 고르지 않았으면 `null`
 * - `onApply`: "공개 범위 보기"를 누르면 고른 값과 함께 호출한다
 * - `onClose`: 시트를 닫는다
 */
export const ScopeSheet = ({ selected, onApply, onClose }) => {
  const [draft, setDraft] = useState(selected)

  return (
    <BottomSheet open title="공개 범위" onClose={onClose}>
      <div className="mx-4 mt-2 flex gap-2 rounded-[20px] border border-[#d9d9d9] px-3 py-3.5">
        {SCOPE_OPTIONS.map((option) => (
          <ChipOption
            key={option.value}
            label={option.label}
            selected={draft === option.value}
            onToggle={() => setDraft(draft === option.value ? null : option.value)}
          />
        ))}
      </div>
      <SheetButtons
        applyLabel="공개 범위 보기"
        onReset={() => setDraft(null)}
        onApply={() => onApply(draft)}
      />
    </BottomSheet>
  )
}
