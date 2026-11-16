import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BoardWriteView } from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/** 게시판 글쓰기 화면의 라우트 입구. 목록의 "수정하기"에서 오면 그 글을 고치는 수정 모드다. */
const BoardWritePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // 목록의 "수정하기"에서 넘어온 글. 비공개 설정으로 이동해 `location.state`가 바뀌어도 처음 값을 유지한다.
  const [editPost] = useState(() => location.state?.editPost)
  return (
    <BoardWriteView
      onBack={() => navigate(ROUTE_PATHS.community)}
      onSubmitted={() => navigate(ROUTE_PATHS.communityPosts, { replace: true })}
      editPost={editPost}
      isPrivateRoute={location.pathname === ROUTE_PATHS.communityWritePrivate}
      onOpenPrivate={() =>
        navigate(ROUTE_PATHS.communityWritePrivate, { state: { fromWrite: true } })
      }
      onClosePrivate={() =>
        location.state?.fromWrite
          ? navigate(-1)
          : navigate(ROUTE_PATHS.communityWrite, { replace: true })
      }
    />
  )
}

export default BoardWritePage
