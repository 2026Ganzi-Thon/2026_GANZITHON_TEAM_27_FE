/**
 * @typedef {object} CommentItem
 * @property {string} id 댓글 ID
 * @property {string} author 작성자
 * @property {string} content 내용
 * @property {string} created_at_label 작성 시간
 * @property {number} [like_count] 공감 수
 */

/**
 * 댓글 목록 섹션.
 * 댓글 총 개수 헤더와 각 댓글 아이템(작성자, 내용, 작성시간, 공감, 옵션 메뉴)을 표시한다.
 *
 * @param {object} props
 * @param {number} props.commentCount 댓글 총 개수
 * @param {CommentItem[]} [props.comments] 댓글 목록
 * @param {(commentId: string) => void} [props.onCommentLike] 댓글 공감 핸들러
 * @param {(commentId: string) => void} [props.onCommentOptions] 댓글 옵션 핸들러
 */
export const BoardCommentSection = ({
  commentCount,
  comments = [],
  onCommentLike,
  onCommentOptions,
}) => (
  <section className="flex flex-col pt-3 pb-24">
    <h3 className="text-base font-semibold text-black">댓글 {commentCount ?? '—'}개</h3>
    <div className="my-3 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />

    <div className="flex flex-col">
      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col">
          <div className="flex items-start justify-between py-2">
            <div className="flex items-start gap-2.5">
              <div className="size-[33px] shrink-0 rounded-full bg-[#d9d9d9]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-black">{comment.author}</span>
                <p className="mt-1 text-sm text-black">{comment.content}</p>
                <span className="mt-1 text-xs text-black">{comment.created_at_label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-black">
              <button
                type="button"
                onClick={() => onCommentLike?.(comment.id)}
                className="hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
              >
                {`♡ ${comment.like_count ?? '—'}`}
              </button>
              <button
                type="button"
                onClick={() => onCommentOptions?.(comment.id)}
                aria-label="댓글 옵션 더보기"
                className="p-1 tracking-widest text-black hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
              >
                . . .
              </button>
            </div>
          </div>
          <div className="my-2 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />
        </div>
      ))}
    </div>
  </section>
)
