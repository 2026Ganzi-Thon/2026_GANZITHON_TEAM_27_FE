import { useNavigate, useParams } from 'react-router-dom'
import {
  BoardDetailView,
  DEMO_POST_ID,
  mockPostDetail,
  useAddComment,
  usePostDetail,
  useTogglePostLike,
} from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시판 상세 화면 입구 (Figma 4-2 게시판 상세).
 * 라우트 파라미터 postId로 게시글을 조회하고, 상세 뷰와 사용자 액션을 연결한다.
 */
const BoardDetailPage = () => {
  const navigate = useNavigate()
  const { postId: paramPostId } = useParams()
  const postId = paramPostId || DEMO_POST_ID

  const { data: post = mockPostDetail, isLoading, isError } = usePostDetail(postId)
  const { mutate: toggleLike } = useTogglePostLike(postId)
  const { mutate: addComment } = useAddComment(postId)

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-canvas">
        <p role="status" className="text-muted">
          게시글을 불러오는 중…
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <p className="text-base text-ink">게시글을 불러오지 못했어요.</p>
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
      onLike={() => toggleLike()}
      onBookmark={() => {
        // TODO(API 확인 필요): 북마크 기능 API 확정 시 연동
      }}
      onAddComment={(content) => addComment({ content })}
    />
  )
}

export default BoardDetailPage
