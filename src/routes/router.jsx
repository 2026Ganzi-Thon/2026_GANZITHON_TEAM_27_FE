import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import {
  BoardPage,
  CaseIntakePage,
  CaseListPage,
  ConsentPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  SignupPage,
} from '@/routes/lazyPages'
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
          { path: ROUTE_PATHS.caseNew, element: <CaseIntakePage /> },
          { path: ROUTE_PATHS.login, element: <LoginPage /> },
          { path: ROUTE_PATHS.signup, element: <SignupPage /> },
          { path: ROUTE_PATHS.consent, element: <ConsentPage /> },
          { path: ROUTE_PATHS.board, element: <BoardPage /> },
          { path: ROUTE_PATHS.cases, element: <CaseListPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
