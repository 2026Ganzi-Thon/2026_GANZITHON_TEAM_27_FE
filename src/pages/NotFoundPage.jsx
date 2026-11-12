import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 정의되지 않은 주소로 들어왔을 때 보여주는 화면.
 */
const NotFoundPage = () => (
  <section className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-xl font-semibold text-heading">페이지를 찾을 수 없어요</h1>
    <p className="text-muted">주소가 바뀌었거나 없는 페이지예요.</p>
    <Link
      to={ROUTE_PATHS.home}
      className="inline-flex min-h-11 items-center rounded-md px-4 font-medium text-heading underline"
    >
      홈으로 가기
    </Link>
  </section>
)

export default NotFoundPage
