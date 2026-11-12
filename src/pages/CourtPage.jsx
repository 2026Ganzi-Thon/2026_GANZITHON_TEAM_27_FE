import { CaseList } from '@/components/CaseList'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { PageHeader } from '@/components/PageHeader'
import { useCases } from '@/features/case'
import { TAB_PATHS } from '@/routes/paths'

/**
 * court(사건목록) 화면 입구. 공통 제목줄과 공통 사건 목록, 하단 탭바를 조합한다.
 * TODO(API 확인 필요): 사건 데이터는 `GET /cases` 연동 전까지 임시 저장소(mock)를 쓴다.
 * TODO(API 확인 필요): 목록은 20개씩 cursor로 받는다(`useInfiniteQuery`). 더 불러오기는 응답 구조가 확정되면 붙인다.
 * TODO(피그마 확인 필요): 사건 카드를 눌렀을 때 이동할 사건 상세 화면이 정해지면 `onSelectCase`를 연결한다.
 */
const CourtPage = () => {
  const { data: cases = [], isPending, isError } = useCases()

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas pt-16.25">
      <PageHeader title="사건 목록" />
      <CaseList cases={cases} isLoading={isPending} isError={isError} className="mt-3.25" />
      <BottomTabBar current="court" paths={TAB_PATHS} />
    </div>
  )
}

export default CourtPage
