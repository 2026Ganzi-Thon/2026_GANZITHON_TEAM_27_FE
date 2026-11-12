import { Link } from 'react-router-dom'

const ACTION_BUTTON =
  'flex h-13.5 items-center justify-center rounded-[41px] bg-ink text-base font-semibold text-canvas disabled:opacity-40'

/**
 * 사건 카드 아래의 "이미지 저장", "공유하기" 버튼.
 * "이미지 저장"은 카드 이미지를 파일로 저장하고, "공유하기"는 게시판 공유 화면으로 이동한다(페이지 이동이라 `Link`).
 *
 * @param {{
 *   onSave: () => void,
 *   shareTo: string,
 *   saveDisabled?: boolean,
 * }} props
 * - `shareTo`: "공유하기"가 이동할 게시판 공유 화면 주소
 * - `saveDisabled`: 카드 이미지가 아직 없으면 `true`로 두어 저장할 수 없게 한다
 */
export const CardActions = ({ onSave, shareTo, saveDisabled = false }) => (
  <div className="grid grid-cols-2 gap-1.75">
    <button type="button" onClick={onSave} disabled={saveDisabled} className={ACTION_BUTTON}>
      이미지 저장
    </button>
    <Link to={shareTo} className={ACTION_BUTTON}>
      공유하기
    </Link>
  </div>
)
