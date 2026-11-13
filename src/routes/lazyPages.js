import { lazy } from 'react'

/**
 * lazy loading으로 불러오는 페이지 목록.
 * 페이지는 구현 전이라도 여기에 먼저 선언하고 router.jsx에서 RootLayout 자식 라우트로 연결한다.
 */
export const HomePage = lazy(() => import('@/pages/HomePage'))
export const CaseIntakePage = lazy(() => import('@/pages/CaseIntakePage'))
export const CaseCardPage = lazy(() => import('@/pages/CaseCardPage'))
export const CommunitySharePage = lazy(() => import('@/pages/CommunitySharePage'))
export const CommunitySharedPage = lazy(() => import('@/pages/CommunitySharedPage'))
export const LoginPage = lazy(() => import('@/pages/LoginPage'))
export const SignupPage = lazy(() => import('@/pages/SignupPage'))
export const ConsentPage = lazy(() => import('@/pages/ConsentPage'))
export const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
export const CourtPage = lazy(() => import('@/pages/CourtPage'))
export const ProsecutionPage = lazy(() => import('@/pages/ProsecutionPage'))
export const DefensePage = lazy(() => import('@/pages/DefensePage'))
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
export const DecisionPage = lazy(() => import('@/pages/DecisionPage'))
export const EmotionChangePage = lazy(() => import('@/pages/EmotionChangePage'))
export const ActionSuggestionPage = lazy(() => import('@/pages/ActionSuggestionPage'))
export const CrisisSupportPage = lazy(() => import('@/pages/CrisisSupportPage'))
export const CaseClosingPage = lazy(() => import('@/pages/CaseClosingPage'))
