import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import RouteErrorPage from '@/pages/RouteErrorPage'
import {
  CaseCardPage,
  CaseIntakePage,
  CommunityPage,
  CommunitySharedPage,
  CommunitySharePage,
  ConsentPage,
  CourtPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProsecutionPage,
  SignupPage,
} from '@/routes/lazyPages'
import { ROUTE_PATHS } from '@/routes/paths'
import { lazy } from 'react'

/**
 * [개발 서버 전용] 미리보기 페이지. 배포 빌드에서는 `import.meta.env.DEV`가 false로 바뀌어
 * 이 import와 페이지 파일이 빌드 결과에서 빠진다. docs/routes.md에는 올리지 않는다.
 */
const RecessModalPreviewPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/dev/RecessModalPreviewPage'))
  : null

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
          { path: ROUTE_PATHS.caseCard, element: <CaseCardPage /> },
          { path: ROUTE_PATHS.communityShare, element: <CommunitySharePage /> },
          { path: ROUTE_PATHS.communityShared, element: <CommunitySharedPage /> },
          { path: ROUTE_PATHS.login, element: <LoginPage /> },
          { path: ROUTE_PATHS.signup, element: <SignupPage /> },
          { path: ROUTE_PATHS.consent, element: <ConsentPage /> },
          { path: ROUTE_PATHS.community, element: <CommunityPage /> },
          { path: ROUTE_PATHS.court, element: <CourtPage /> },
          { path: ROUTE_PATHS.prosecution, element: <ProsecutionPage /> },
          { path: '*', element: <NotFoundPage /> },
          ...(RecessModalPreviewPage
            ? [{ path: '/dev/recess-modal', element: <RecessModalPreviewPage /> }]
            : []),
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
