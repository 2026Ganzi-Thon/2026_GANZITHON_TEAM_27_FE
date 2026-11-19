import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { BoardHeader, PostListSection, WriteButton } from '@/features/community'
import { getCommunityPostPath, ROUTE_PATHS, TAB_PATHS } from '@/routes/paths'

/**
 * community 게시판 목록 화면 입구(Figma `4-1 게시판 목록`). 헤더, 필터와 글 목록, 글쓰기 버튼, 하단 탭바를 조합한다.
 * "사건 유형", "공개 범위" 버튼을 누르면 선택 시트가 열린다.
 * 페이지 최상위 요소에 `relative`를 두지 않는다. 시트가 프레임 전체를 덮어야 하기 때문이다.
 */
const CommunityPostsPage = () => (
  <div className="flex min-h-full flex-1 flex-col bg-canvas">
    <BoardHeader />
    <h1 className="sr-only">게시판 목록</h1>
    <PostListSection getPostPath={getCommunityPostPath} />
    <BottomTabBar current="community" paths={TAB_PATHS} />
    <WriteButton to={ROUTE_PATHS.communityWrite} />
  </div>
)

export default CommunityPostsPage
