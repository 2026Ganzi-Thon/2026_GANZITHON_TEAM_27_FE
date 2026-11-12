import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import {
  ConsentPage,
  DefensePage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProsecutionPage,
  SignupPage,
} from '@/routes/lazyPages'
import { ROUTE_PATHS } from '@/routes/paths'
import { DecisionPage } from '@/routes/lazyPages'

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
          { path: ROUTE_PATHS.login, element: <LoginPage /> },
          { path: ROUTE_PATHS.signup, element: <SignupPage /> },
          { path: ROUTE_PATHS.consent, element: <ConsentPage /> },
          { path: ROUTE_PATHS.prosecution, element: <ProsecutionPage /> },
          { path: ROUTE_PATHS.defense, element: <DefensePage /> },
          { path: '*', element: <NotFoundPage /> },
          { path: ROUTE_PATHS.decision, element: <DecisionPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
