import { Link } from 'react-router-dom'
/**
 * 게시판 메인 "THE FEED"의 글 하나. 분류, 제목, 익명·좋아요·댓글 수, 올린 시각을 보여준다.
 *
 * @param {{ to: string, post: { title: string, tagLabel: string, likes: number, comments: number, timeLabel: string } }} props
 * - `post`: 보여줄 글(`toPostView`의 결과)
 */
export const FeedItem = ({ post, to }) => (
  <Link to={to} className="relative block cursor-pointer h-14.25 text-black">
    <p className="absolute top-0 left-0 text-xs leading-[normal]">{post.tagLabel}</p>
    <h3 className="absolute top-4.75 left-0 text-base leading-[normal] font-semibold">
      {post.title}
    </h3>
    <p className="absolute top-10.75 left-0 flex gap-2.5 text-xs leading-[normal]">
      <span>익명</span>
      <span>♡ {post.likes}</span>
      <span>댓글 {post.comments}</span>
    </p>
    <time className="absolute top-6 right-0 text-xs leading-[normal]">{post.timeLabel}</time>
  </Link>
)
