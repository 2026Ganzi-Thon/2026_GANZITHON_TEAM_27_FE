import { Link, useRouteError } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 페이지를 그리다 오류가 났을 때 RootLayout 안에서 보여주는 화면.
 * lazy loading 실패(배포 직후 파일 변경 등)도 여기서 처리한다.
 */
const RouteErrorPage = () => {
  const error = useRouteError()
  console.error(error)

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <section
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-xl font-semibold text-heading">문제가 생겼어요</h1>
      <p className="text-muted">잠시 후 다시 시도해 주세요.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRetry}
          className="min-h-11 rounded-md bg-heading px-4 font-medium text-surface"
        >
          다시 시도
        </button>
        <Link
          to={ROUTE_PATHS.home}
          className="inline-flex min-h-11 items-center rounded-md px-4 font-medium text-heading underline"
        >
          홈으로 가기
        </Link>
      </div>
    </section>
  )
}

export default RouteErrorPage
