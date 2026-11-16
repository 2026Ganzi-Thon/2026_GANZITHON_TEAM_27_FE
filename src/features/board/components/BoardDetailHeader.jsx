import iconBackUrl from '@/assets/board/icon-back.svg'
import iconShareUrl from '@/assets/board/icon-share.svg'

/**
 * 게시판 상세 화면 상단 헤더.
 * 뒤로가기 버튼, "게시판" 타이틀, 공유 아이콘을 제공한다.
 *
 * @param {object} props
 * @param {() => void} [props.onBack] 뒤로가기 클릭 핸들러
 * @param {() => void} [props.onShare] 공유하기 클릭 핸들러
 * @param {boolean} [props.showShare] 공유 버튼 표시 여부
 */
export const BoardDetailHeader = ({ onBack, onShare, showShare = true }) => (
  <header className="relative flex h-16 w-full items-center justify-between px-2 text-ink">
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로 가기"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
    >
      <img src={iconBackUrl} alt="" width={8} height={15} />
    </button>

    <h1 className="text-base font-semibold text-black">게시판</h1>

    {showShare ? (
      <button
        type="button"
        onClick={onShare}
        aria-label="게시글 공유"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
      >
        <img src={iconShareUrl} alt="" width={23} height={23} />
      </button>
    ) : (
      <span className="size-11" aria-hidden="true" />
    )}
  </header>
)
