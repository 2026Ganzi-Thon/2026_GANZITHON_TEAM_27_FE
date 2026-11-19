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
 * @param {import('@/api/mapBoardPost').BoardPostViewModel} props.post 게시글 데이터
 * @param {() => void} [props.onBack] 뒤로가기 핸들러
 * @param {() => void} [props.onShare] 공유 핸들러
 * @param {() => void} [props.onLike] 게시글 공감 핸들러
 * @param {() => void} [props.onBookmark] 북마크 핸들러
 * @param {(values: { title: string, body: string }) => void} [props.onEditPost] 게시글 수정 핸들러
 * @param {() => void} [props.onDeletePost] 게시글 삭제 핸들러
 * @param {boolean} [props.isUpdatingPost] 게시글 수정 중 여부
 * @param {boolean} [props.isDeletingPost] 게시글 삭제 중 여부
 * @param {(content: string) => void} [props.onAddComment] 댓글 등록 핸들러
 * @param {(commentId: string, currentlyLiked: boolean) => void} [props.onCommentLike] 댓글 공감 핸들러
 * @param {(commentId: string, content: string) => void} [props.onEditComment] 댓글 수정 핸들러
 * @param {(commentId: string) => void} [props.onDeleteComment] 댓글 삭제 핸들러
 */
export const BoardDetailView = ({
  post,
  onBack,
  onShare,
  onLike,
  onBookmark,
  onEditPost,
  onDeletePost,
  isUpdatingPost = false,
  isDeletingPost = false,
  onAddComment,
  onCommentLike,
  onEditComment,
  onDeleteComment,
}) => {
  const handleCommentClick = () => {
    // 댓글 영역으로 스크롤
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas px-4">
      <BoardDetailHeader onBack={onBack} onShare={onShare} />

      <main className="flex flex-1 flex-col">
        <BoardPostContent
          title={post.title}
          content={post.content}
          author={post.author}
          createdAtLabel={post.created_at_label}
          likeCount={post.like_count}
          isMine={Boolean(post.is_mine)}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          isUpdating={isUpdatingPost}
          isDeleting={isDeletingPost}
        />

        <div className="mt-6 h-[1px] w-full bg-[#e7e7e7]" aria-hidden="true" />

        <BoardActionBar
          likeCount={post.like_count}
          isLiked={post.is_liked}
          isBookmarked={post.is_bookmarked}
          onLike={onLike}
          onCommentClick={handleCommentClick}
          onBookmark={onBookmark}
        />

        <BoardCommentSection
          commentCount={post.comment_count}
          comments={post.comments}
          onCommentLike={onCommentLike}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      </main>

      <BoardCommentInput onSubmit={onAddComment ?? (() => {})} />
    </div>
  )
}
