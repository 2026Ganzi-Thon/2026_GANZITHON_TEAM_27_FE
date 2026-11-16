import { useLocation, useNavigate } from 'react-router-dom'
import { BoardWriteView } from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시판 글쓰기 화면의 라우트 입구.
 * - 등록에 성공하면 게시 완료 화면(`/community/shared`)으로 간다. 비공개 설정 하위 경로 기록이 남지 않도록 replace한다.
 * - 응답이 위기 안내(`support_required`)면 위기 안내 화면으로 replace 이동한다(작성 내용은 주소·기록에 남기지 않는다).
 */
const BoardWritePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <BoardWriteView
      onBack={() => navigate(ROUTE_PATHS.community)}
      isPrivateRoute={location.pathname === ROUTE_PATHS.communityWritePrivate}
      onOpenPrivate={() =>
        navigate(ROUTE_PATHS.communityWritePrivate, { state: { fromWrite: true } })
      }
      onClosePrivate={() =>
        location.state?.fromWrite
          ? navigate(-1)
          : navigate(ROUTE_PATHS.communityWrite, { replace: true })
      }
      onSubmitted={() => navigate(ROUTE_PATHS.communityShared, { replace: true })}
      onSupportRequired={() => navigate(ROUTE_PATHS.crisisSupport, { replace: true })}
    />
  )
}

export default BoardWritePage
