import { useNavigate } from 'react-router-dom'
import { BoardWriteView } from '@/features/board'
import { ROUTE_PATHS } from '@/routes/paths'

/** 게시판 글쓰기 화면의 라우트 입구. */
const BoardWritePage = () => {
  const navigate = useNavigate()
  return <BoardWriteView onBack={() => navigate(ROUTE_PATHS.community)} />
}

export default BoardWritePage
