import { useRef } from 'react'
import { BoardActionBar } from './BoardActionBar'
import { BoardCommentInput } from './BoardCommentInput'
import { BoardCommentSection } from './BoardCommentSection'
import { BoardDetailHeader } from './BoardDetailHeader'
import { BoardPostContent } from './BoardPostContent'

/**
 * 게시판 상세 뷰 전체 컴포넌트.
 * 헤더, 본문, 액션바, 댓글 영역, 하단 입력창을 조합한다.
 *
 * @param {object} props
 * @param {import('../mocks/boardMocks').mockPostDetail} props.post 게시글 데이터
 * @param {() => void} [props.onBack] 뒤로가기 핸들러
 * @param {() => void} [props.onShare] 공유 핸들러
 * @param {() => void} [props.onLike] 게시글 공감 핸들러
 * @param {() => void} [props.onBookmark] 북마크 핸들러
 * @param {(content: string) => void} [props.onAddComment] 댓글 등록 핸들러
 */
export const BoardDetailView = ({ post, onBack, onShare, onLike, onBookmark, onAddComment }) => {
  const commentsRef = useRef(null)

  /** 프레임 안에서 댓글 영역으로 이동한다. */
  const handleCommentClick = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas pt-status-bar">
      <BoardDetailHeader onBack={onBack} onShare={onShare} />

      <div className="flex flex-1 flex-col px-4">
        <BoardPostContent
          title={post.title}
          content={post.content}
          author={post.author}
          createdAtLabel={post.created_at_label}
          likeCount={post.like_count}
        />

        <div className="mt-6 h-px w-full shrink-0 bg-field" aria-hidden="true" />

        <BoardActionBar
          likeCount={post.like_count}
          isLiked={post.is_liked}
          isBookmarked={post.is_bookmarked}
          onLike={onLike}
          onCommentClick={handleCommentClick}
          onBookmark={onBookmark}
        />

        <div ref={commentsRef}>
          <BoardCommentSection commentCount={post.comment_count} comments={post.comments} />
        </div>
      </div>

      <div className="sticky bottom-0 px-4">
        <BoardCommentInput onSubmit={onAddComment ?? (() => {})} />
      </div>
    </div>
  )
}
