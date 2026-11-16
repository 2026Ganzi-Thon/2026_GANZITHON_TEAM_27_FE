import { useNavigate } from 'react-router-dom'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { BoardHeader, PostListSection, WriteButton } from '@/features/community'
import { getCommunityPostPath, ROUTE_PATHS, TAB_PATHS } from '@/routes/paths'

/**
 * community 게시판 목록 화면 입구(Figma `4-1 게시판 목록`). 헤더, 필터와 글 목록, 글쓰기 버튼, 하단 탭바를 조합한다.
 * "사건 유형", "공개 범위" 버튼을 누르면 선택 시트가 열린다.
 * 내 글의 "수정하기"를 누르면 글쓰기 화면이 그 글의 내용으로 채워진 채 열린다(수정 모드).
 * 페이지 최상위 요소에 `relative`를 두지 않는다. 시트가 프레임 전체를 덮어야 하기 때문이다.
 */
const CommunityPostsPage = () => {
  const navigate = useNavigate()

  /** 수정할 글의 내용을 글쓰기 화면에 넘긴다(비밀번호는 다시 입력한다). */
  const editPost = ({ id, title, body, visibility }) =>
    navigate(ROUTE_PATHS.communityWrite, { state: { editPost: { id, title, body, visibility } } })

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <BoardHeader />
      <h1 className="sr-only">게시판 목록</h1>
      <PostListSection getPostPath={getCommunityPostPath} onEditPost={editPost} />
      <BottomTabBar current="community" paths={TAB_PATHS} />
      <WriteButton to={ROUTE_PATHS.communityWrite} />
    </div>
  )
}

export default CommunityPostsPage
