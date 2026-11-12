import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { TAB_PATHS } from '@/routes/paths'

/**
 * community(게시판) 화면 입구. 피그마 화면이 확정되면 feature 화면을 조합한다.
 * TODO(피그마 확인 필요): 임시 화면이다. 하단 탭바 연동 확인용으로만 쓴다.
 */
const BoardPage = () => (
  <div className="flex flex-1 flex-col">
    <section className="grid flex-1 place-items-center p-6">
      <h1 className="text-2xl font-semibold text-heading">community</h1>
    </section>
    <BottomTabBar current="board" paths={TAB_PATHS} />
  </div>
)

export default BoardPage
