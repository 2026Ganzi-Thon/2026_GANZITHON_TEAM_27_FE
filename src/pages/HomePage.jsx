import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { TAB_PATHS } from '@/routes/paths'

/**
 * 홈 화면 입구. 피그마 화면이 확정되면 feature 화면을 조합한다.
 */
const HomePage = () => (
  <div className="flex flex-1 flex-col">
    <section className="grid flex-1 place-items-center p-6">
      <h1 className="text-2xl font-semibold text-heading">체포하겠어</h1>
    </section>
    <BottomTabBar current="home" paths={TAB_PATHS} />
  </div>
)

export default HomePage
