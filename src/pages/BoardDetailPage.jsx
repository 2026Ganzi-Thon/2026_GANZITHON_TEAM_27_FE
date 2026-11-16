import { useNavigate, useParams } from 'react-router-dom'
import {
  BoardDetailView,
  useAddComment,
  useDeleteBoardPost,
  useDeleteComment,
  useToggleCommentLike,
  usePostDetail,
  useTogglePostLike,
  useUpdateComment,
} from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시판 상세 화면 입구 (Figma 4-2 게시판 상세).
 * 라우트 파라미터 postId로 게시글을 조회하고, 상세 뷰와 사용자 액션을 연결한다.
 * - 공감은 글·댓글마다 한 번까지이고, 다시 누르면 취소된다.
 * - 내 글의 "···"에서 수정하기(글쓰기 화면이 그 글로 채워져 열린다)와 삭제하기를 쓸 수 있고, 내 댓글도 고치고 지울 수 있다.
 */
const BoardDetailPage = () => {
  const navigate = useNavigate()
  const { postId } = useParams()

  const { data: post, isPending, isError, error, refetch, isFetching } = usePostDetail(postId)
  const { mutate: toggleLike } = useTogglePostLike(postId)
  const { mutate: addComment } = useAddComment(postId)
  const { mutate: updateComment } = useUpdateComment(postId)
  const { mutate: deleteComment } = useDeleteComment(postId)
  const { mutate: toggleCommentLike } = useToggleCommentLike(postId)
  const { mutate: deletePost } = useDeleteBoardPost(postId)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(ROUTE_PATHS.community)
  }

  const handleShare = () => {
    // TODO(API 확인 필요): 웹 공유 API 또는 링크 복사 기능 연결
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        })
        .catch(() => {})
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p role="status" className="text-muted">
          게시글을 불러오는 중…
        </p>
      </div>
    )
  }

  if (isError || (!post?.title && !post?.content)) {
    const notFound = error?.response?.status === 404
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <p role="alert" className="text-base text-ink">
          {notFound
            ? '존재하지 않거나 열람할 수 없는 글이에요.'
            : isError
              ? '게시글을 불러오지 못했어요.'
              : '게시글 내용이 비어 있어요.'}
        </p>
        {!notFound && (
          <button
            type="button"
            disabled={isFetching}
            onClick={() => refetch()}
            className="min-h-11 rounded-full bg-ink px-5 text-sm text-field"
          >
            {isFetching ? '불러오는 중…' : '다시 시도'}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(ROUTE_PATHS.community)}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-field"
        >
          게시판으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <BoardDetailView
      post={post}
      onBack={handleBack}
      onShare={handleShare}
      onLike={() => toggleLike(Boolean(post.is_liked))}
      onBookmark={() => {
        // TODO(API 확인 필요): 북마크 기능 API 확정 시 연동
      }}
      onAddComment={(content) => addComment({ content })}
      onEditPost={() =>
        navigate(ROUTE_PATHS.communityWrite, {
          state: {
            editPost: {
              id: postId,
              title: post.title,
              body: post.content,
              visibility: post.visibility,
            },
          },
        })
      }
      onDeletePost={() =>
        deletePost(undefined, {
          onSuccess: () => navigate(ROUTE_PATHS.communityPosts, { replace: true }),
        })
      }
      onCommentLike={(commentId) => {
        const target = post.comments?.find((comment) => comment.id === commentId)
        toggleCommentLike({ commentId, baseLiked: Boolean(target?.is_liked) })
      }}
      onCommentEdit={(commentId, content) => updateComment({ commentId, content })}
      onCommentDelete={(commentId) => deleteComment(commentId)}
    />
  )
}

export default BoardDetailPage
