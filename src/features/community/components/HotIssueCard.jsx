import { Link } from 'react-router-dom'
/**
 * 게시판 메인의 "HOT ISSUE" 카드. 지금 가장 인기 있는 글 하나를 크게 보여준다.
 *
 * TODO(API 확인 필요): "익명 · 12 COMMENTS"의 익명 표시와 댓글 수 필드가 확정되면 맞춘다.
 *
 * @param {{ to: string, post: { title: string, comments: number }, rank?: number }} props
 * - `post`: 보여줄 글(`toPostView`의 결과)
 * - `rank`: 인기 순위. "HOT ISSUE / 001"의 숫자로 쓴다
 */
export const HotIssueCard = ({ post, rank = 1, to }) => (
  <Link
    to={to}
    aria-label={`인기 글: ${post.title}`}
    className="relative block cursor-pointer mx-4 h-30.25 shrink-0 rounded-[5px] bg-sky text-ink"
  >
    <p className="absolute top-5.75 left-4 text-base leading-[normal] font-semibold">
      HOT ISSUE / {String(rank).padStart(3, '0')}
    </p>
    <h2 className="absolute top-13.75 left-[15px] text-xl leading-[normal] font-medium">
      {post.title}
    </h2>
    <p className="absolute top-21 left-[15px] text-xs leading-[normal]">
      익명 · {post.comments} COMMENTS
    </p>
  </Link>
)
