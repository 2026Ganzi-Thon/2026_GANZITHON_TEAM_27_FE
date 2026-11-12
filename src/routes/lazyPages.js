import { lazy } from 'react'

/**
 * lazy loading으로 불러오는 페이지 목록.
 * 페이지는 구현 전이라도 여기에 먼저 선언하고 router.jsx에서 RootLayout 자식 라우트로 연결한다.
 */
export const HomePage = lazy(() => import('@/pages/HomePage'))
export const CaseIntakePage = lazy(() => import('@/pages/CaseIntakePage'))
export const LoginPage = lazy(() => import('@/pages/LoginPage'))
export const SignupPage = lazy(() => import('@/pages/SignupPage'))
export const ConsentPage = lazy(() => import('@/pages/ConsentPage'))
export const BoardPage = lazy(() => import('@/pages/BoardPage'))
export const CaseListPage = lazy(() => import('@/pages/CaseListPage'))
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
