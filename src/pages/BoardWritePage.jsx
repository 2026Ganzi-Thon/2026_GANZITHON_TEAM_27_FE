import { useLocation, useNavigate } from 'react-router-dom'
import { BoardWriteView } from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/** 게시판 글쓰기 화면의 라우트 입구. */
const BoardWritePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <BoardWriteView
      onBack={() => navigate(ROUTE_PATHS.community)}
      onSubmitted={() => navigate(ROUTE_PATHS.communityPosts, { replace: true })}
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
