import iconBookmarkUrl from '@/assets/board/icon-bookmark.svg'
import iconCommentUrl from '@/assets/board/icon-comment.svg'
import iconHeartUrl from '@/assets/board/icon-heart.svg'

/**
 * 게시글 인터랙션 액션 바.
 * 공감(하트+카운트), 댓글 바로가기, 북마크 버튼을 제공한다.
 *
 * @param {object} props
 * @param {number} props.likeCount 공감 수
 * @param {boolean} [props.isLiked] 공감 여부
 * @param {boolean} [props.isBookmarked] 북마크 여부
 * @param {() => void} [props.onLike] 공감 클릭 핸들러
 * @param {() => void} [props.onCommentClick] 댓글 버튼 클릭 핸들러
 * @param {() => void} [props.onBookmark] 북마크 클릭 핸들러
 */
export const BoardActionBar = ({
  likeCount = 24,
  isLiked = true,
  isBookmarked = false,
  onLike,
  onCommentClick,
  onBookmark,
}) => (
  <div className="flex items-center justify-between py-4">
    <button
      type="button"
      onClick={onLike}
      aria-label={`공감하기 (${likeCount}개)`}
      className={`flex h-[38px] w-[70px] items-center justify-center gap-1 rounded-[5px] transition-transform active:scale-95 ${
        isLiked ? 'bg-bubble' : 'bg-field'
      } hover:opacity-90 focus-visible:outline-2 focus-visible:outline-focus`}
    >
      <img src={iconHeartUrl} alt="" width={20} height={20} />
      <span className="text-base font-semibold text-black">{likeCount}</span>
    </button>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCommentClick}
        aria-label="댓글로 이동"
        className="flex h-[38px] w-[43px] items-center justify-center rounded-[5px] bg-field transition-transform active:scale-95 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-focus"
      >
        <img src={iconCommentUrl} alt="" width={16} height={16} />
      </button>

      <button
        type="button"
        onClick={onBookmark}
        aria-label={isBookmarked ? '북마크 취소' : '북마크 추가'}
        className={`flex h-[38px] w-[43px] items-center justify-center rounded-[5px] transition-transform active:scale-95 ${
          isBookmarked ? 'bg-bubble' : 'bg-field'
        } hover:opacity-80 focus-visible:outline-2 focus-visible:outline-focus`}
      >
        <img src={iconBookmarkUrl} alt="" width={13} height={15} />
      </button>
    </div>
  </div>
)
