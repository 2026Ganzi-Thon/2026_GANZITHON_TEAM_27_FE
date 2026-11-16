/**
 * 게시글 본문 섹션.
 * 게시글 제목, 작성자 아바타 및 메타 정보(익명, 시간, 공감 수, 더보기), 본문 텍스트를 표시한다.
 *
 * @param {object} props
 * @param {string} props.title 게시글 제목
 * @param {string} props.content 게시글 본문
 * @param {string} [props.author] 작성자명
 * @param {string} [props.createdAtLabel] 작성 시간 표시
 * @param {number} [props.likeCount] 공감 수
 * @param {() => void} [props.onOptionsClick] 더보기 메뉴 클릭 핸들러
 */
export const BoardPostContent = ({
  title,
  content,
  author,
  createdAtLabel,
  likeCount,
  onOptionsClick,
}) => (
  <article className="flex flex-col pt-3">
    <h2 className="text-[24px] font-semibold leading-tight text-black">{title}</h2>

    <div className="mt-4.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="size-[33px] shrink-0 rounded-full bg-[#d9d9d9]" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-black">{author}</span>
          <span className="text-xs font-normal text-black">{createdAtLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs font-normal text-black">
        <span>{`♡ ${likeCount ?? '—'}`}</span>
        <button
          type="button"
          onClick={onOptionsClick}
          aria-label="게시글 옵션 더보기"
          className="p-1 tracking-widest text-black hover:opacity-70 focus-visible:outline-2 focus-visible:outline-focus"
        >
          . . .
        </button>
      </div>
    </div>

    <div className="mt-4 whitespace-pre-line text-sm leading-[1.3] text-black">{content}</div>
  </article>
)
