import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { VISIBILITY } from '@/constants/visibility'
import {
  BoardDetailView,
  BoardUnlockForm,
  useAddComment,
  useDeleteBoardPost,
  useDeleteComment,
  usePostDetail,
  useToggleCommentLike,
  useTogglePostBookmark,
  useTogglePostLike,
  useUnlockPost,
  useUpdateComment,
  useUpdatePost,
} from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시판 상세 화면 입구 (Figma 4-2 게시판 상세).
 * 라우트 파라미터 postId로 게시글을 조회하고, 상세 뷰와 사용자 액션을 연결한다.
 * 상세가 `404`면(남의 비공개 글일 수 있다) 비밀번호로 여는 폼을 함께 보여준다(`POST /board/posts/{pid}/unlock`).
 * 연 글은 캐시에 두지 않고 `useUnlockPost` 상태로만 보여준다.
 */
const BoardDetailPage = () => {
  const navigate = useNavigate()
  const { postId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialEditing = searchParams.get('edit') === '1'

  const {
    data: fetchedPost,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePostDetail(postId)
  const unlocked = useUnlockPost(postId)
  const { mutate: toggleLike } = useTogglePostLike(postId)
  const { mutate: toggleBookmark } = useTogglePostBookmark(postId)
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost(postId)
  const { mutate: deletePost, isPending: isDeletingPost } = useDeleteBoardPost(postId)
  const { mutate: addComment } = useAddComment(postId)
  const { mutate: updateComment } = useUpdateComment(postId)
  const { mutate: deleteComment } = useDeleteComment(postId)
  const { mutate: toggleCommentLike } = useToggleCommentLike(postId)
  const post = unlocked.post ?? fetchedPost
  const isProtected = post?.visibility === VISIBILITY.passwordProtected

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

  /** 공감 토글. 보호 글(`password_protected`)에서는 공감 API를 호출하지 않는다. */
  const handleLike = () => {
    if (isProtected) return
    toggleLike(Boolean(post?.is_liked), {
      onSuccess: (result) => {
        if (unlocked.post) unlocked.applyLike(result)
      },
    })
  }

  /** 북마크 토글. 보호 글(`password_protected`)에서는 북마크 API를 호출하지 않는다. */
  const handleBookmark = () => {
    if (isProtected) return
    toggleBookmark(Boolean(post?.is_bookmarked))
  }

  /** 내 글 수정. 위기 안내 응답이면 지원 안내 화면으로 이동한다. */
  const handleEditPost = (values) => {
    updatePost(values, {
      onSuccess: (result) => {
        if (result?.outcome === 'support_required') {
          navigate(ROUTE_PATHS.support, { replace: true })
          return
        }
        if (searchParams.has('edit')) {
          setSearchParams({}, { replace: true })
        }
      },
    })
  }

  /** 내 글 삭제. 성공하면 게시판 목록으로 돌아간다. */
  const handleDeletePost = () => {
    deletePost(undefined, {
      onSuccess: () => {
        navigate(ROUTE_PATHS.community, { replace: true })
      },
    })
  }

  /** 댓글 등록. 보호 글(`password_protected`)에서는 댓글 API를 호출하지 않는다. */
  const handleAddComment = (content) => {
    if (isProtected) return
    addComment(
      { content },
      {
        onSuccess: (comment) => {
          if (comment?.outcome === 'support_required') {
            navigate(ROUTE_PATHS.support, { replace: true })
            return
          }
          if (unlocked.post) unlocked.appendComment(comment)
        },
      },
    )
  }

  /** 댓글 공감 토글. 보호 글에서는 호출하지 않는다. */
  const handleCommentLike = (commentId, currentlyLiked) => {
    if (isProtected) return
    toggleCommentLike({ commentId, currentlyLiked })
  }

  /** 내 댓글 수정. 위기 안내 응답이면 지원 안내 화면으로 이동한다. */
  const handleEditComment = (commentId, content) => {
    if (isProtected) return
    updateComment(
      { commentId, content },
      {
        onSuccess: (result) => {
          if (result?.outcome === 'support_required') {
            navigate(ROUTE_PATHS.support, { replace: true })
          }
        },
      },
    )
  }

  /** 내 댓글 삭제. 보호 글에서는 호출하지 않는다. */
  const handleDeleteComment = (commentId) => {
    if (isProtected) return
    deleteComment(commentId)
  }

  if (isPending && !unlocked.post) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p role="status" className="text-muted">
          게시글을 불러오는 중…
        </p>
      </div>
    )
  }

  if (!unlocked.post && (isError || (!post?.title && !post?.content))) {
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
        {notFound && (
          <BoardUnlockForm
            onUnlock={unlocked.unlock}
            isPending={unlocked.isPending}
            error={unlocked.errorMessage}
          />
        )}
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
      onLike={handleLike}
      onBookmark={handleBookmark}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      initialEditing={initialEditing}
      isUpdatingPost={isUpdatingPost}
      isDeletingPost={isDeletingPost}
      onAddComment={handleAddComment}
      onCommentLike={handleCommentLike}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
    />
  )
}

export default BoardDetailPage
