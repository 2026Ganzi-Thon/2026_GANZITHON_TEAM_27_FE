import { BottomTabBar } from '@/components/layout/BottomTabBar'
import {
  HomeHeader,
  HomeHero,
  mockRecentCases,
  NewCaseButton,
  RecentCaseList,
} from '@/features/home'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 홈 화면(신규) 입구. 로고, 마스코트, 접수 버튼, 최근 사건, 탭바를 조합한다.
 * TODO(API 확인 필요): 목록은 `GET /cases` 연동 전까지 임시 데이터를 쓴다.
 */
const HomePage = () => (
  <div className="flex min-h-full flex-1 flex-col bg-canvas">
    <HomeHeader />
    <HomeHero />
    <NewCaseButton />
    <RecentCaseList cases={mockRecentCases} />
    <BottomTabBar
      homePath={ROUTE_PATHS.home}
      boardPath={ROUTE_PATHS.board}
      summaryPath={ROUTE_PATHS.summary}
    />
  </div>
)

export default HomePage
