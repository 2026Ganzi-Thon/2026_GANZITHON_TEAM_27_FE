import lockClosedUrl from '@/assets/share/lock-closed.svg'
import lockOpenUrl from '@/assets/share/lock-open.svg'
import { VISIBILITY } from '@/constants/visibility'
import { VisibilityOption } from './VisibilityOption'

/** 공개 범위 선택지. 순서는 화면의 위에서 아래 순서다. */
const OPTIONS = [
  {
    value: VISIBILITY.public,
    title: '전체 공개',
    description: '모든 사용자가 볼 수 있어요.',
    iconUrl: lockOpenUrl,
  },
  {
    value: VISIBILITY.passwordProtected,
    title: '비공개',
    description: '비밀번호를 입력해야 볼 수 있어요.',
    iconUrl: lockClosedUrl,
  },
]

/**
 * "공개 범위 선택" 제목과 선택 카드 두 개. 처음에는 아무것도 선택되어 있지 않다.
 *
 * @param {{ value: string | null, onChange: (value: string) => void }} props
 * - `value`: 선택된 공개 범위. 아직 고르지 않았으면 `null`
 * - `onChange`: 공개 범위를 고르면 그 값과 함께 호출한다
 */
export const VisibilityPicker = ({ value, onChange }) => (
  <fieldset className="mx-4">
    <legend className="text-base leading-[normal] font-semibold text-ink">공개 범위 선택</legend>
    <div className="mt-2.75 flex flex-col gap-2.75">
      {OPTIONS.map((option) => (
        <VisibilityOption
          key={option.value}
          {...option}
          checked={value === option.value}
          onChange={onChange}
        />
      ))}
    </div>
  </fieldset>
)
