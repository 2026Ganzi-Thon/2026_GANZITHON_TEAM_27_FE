import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { HomePage, NotFoundPage } from '@/routes/lazyPages'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 앱 라우트 정의. 모든 페이지는 RootLayout 안에서 lazy loading으로 렌더링한다.
 * 오류 화면도 RootLayout 안에서 보이도록 errorElement를 자식 라우트에 둔다.
 */
export const routes = [
  {
    element: <RootLayout />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { path: ROUTE_PATHS.home, element: <HomePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
