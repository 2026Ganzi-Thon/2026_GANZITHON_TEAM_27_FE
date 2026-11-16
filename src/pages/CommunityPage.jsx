import { BottomTabBar } from '@/components/layout/BottomTabBar'
import {
  BoardHeader,
  CommunityTitle,
  FeedSection,
  HotIssueCard,
  usePosts,
  WriteButton,
} from '@/features/community'
import { ROUTE_PATHS, TAB_PATHS } from '@/routes/paths'

/** 메인에서 "THE FEED"에 보여줄 최근 글 개수. */
const FEED_COUNT = 3

/**
 * community(게시판) 메인 화면 입구(Figma `4-1 게시판`). 제목 영역, HOT ISSUE, THE FEED, 글쓰기 버튼, 하단 탭바를 조합한다.
 * "VIEW ALL ↗"을 누르면 게시판 목록으로 간다.
 * TODO(API 확인 필요): 글 데이터는 `GET /board/posts` 연동 전까지 임시 데이터(mock)를 쓴다.
 */
const CommunityPage = () => {
  const { data: posts = [], isPending, isError } = usePosts()
  const hotPost = posts.find((post) => post.isHot && !post.isLocked)
  const feedPosts = posts.filter((post) => post.id !== hotPost?.id).slice(0, FEED_COUNT)

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <BoardHeader />
      <CommunityTitle />
      {hotPost && <HotIssueCard post={hotPost} rank={1} />}
      <FeedSection
        posts={feedPosts}
        viewAllTo={ROUTE_PATHS.communityPosts}
        isLoading={isPending}
        isError={isError}
      />
      <BottomTabBar current="community" paths={TAB_PATHS} />
      <WriteButton />
    </div>
  )
}

export default CommunityPage
