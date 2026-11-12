import { CaseList } from '@/components/CaseList'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import {
  HomeHeader,
  HomeHero,
  mockRecentCases,
  mockResumeCase,
  NewCaseButton,
  ResumeCaseCard,
} from '@/features/home'
import { TAB_PATHS } from '@/routes/paths'

/**
 * 홈 화면(재방문) 입구. 위쪽에 진행 중인 사건을 보여주고 이어하기·삭제·새 사건 접수를 제공한다.
 * TODO(API 확인 필요): 진행 중인 사건과 목록은 `GET /cases` 연동 전까지 임시 데이터를 쓴다.
 */
const HomeResumePage = () => (
  <div className="flex min-h-full flex-1 flex-col bg-canvas">
    <HomeHeader />
    <HomeHero variant="resume" />
    <div className="mt-0.75 flex flex-col">
      <ResumeCaseCard {...mockResumeCase} />
    </div>
    <NewCaseButton label="새 사건 접수하기" className="mt-8" />
    <CaseList cases={mockRecentCases} className="mt-7.5" />
    <BottomTabBar current="home" paths={TAB_PATHS} />
  </div>
)

export default HomeResumePage
