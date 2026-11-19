import { Link } from 'react-router-dom'

const ACTION_BUTTON =
  'flex h-13.5 items-center justify-center rounded-[41px] bg-ink text-base font-semibold text-canvas disabled:opacity-40'

/**
 * 사건 카드 아래의 "이미지 저장", "공유하기" 버튼.
 * "이미지 저장"은 카드 이미지를 파일로 저장하고, "공유하기"는 `onShare`가 있으면 인스타 스토리 공유를 실행한다.
 *
 * @param {{
 *   onSave: () => void,
 *   onShare?: () => void,
 *   shareTo?: string,
 *   saveDisabled?: boolean,
 * }} props
 * - `onShare`: 인스타 스토리 공유 핸들러
 * - `shareTo`: `onShare`가 없을 때 이동할 주소
 * - `saveDisabled`: 카드 이미지가 아직 없으면 `true`로 두어 비활성화한다
 */
export const CardActions = ({ onSave, onShare, shareTo, saveDisabled = false }) => (
  <div className="grid grid-cols-2 gap-1.75">
    <button type="button" onClick={onSave} disabled={saveDisabled} className={ACTION_BUTTON}>
      이미지 저장
    </button>
    {onShare ? (
      <button type="button" onClick={onShare} disabled={saveDisabled} className={ACTION_BUTTON}>
        공유하기
      </button>
    ) : (
      <Link to={shareTo} className={ACTION_BUTTON}>
        공유하기
      </Link>
    )}
  </div>
)
