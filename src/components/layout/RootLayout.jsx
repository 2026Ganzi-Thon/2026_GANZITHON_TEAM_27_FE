import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

/**
 * 모든 화면을 감싸는 최상위 레이아웃. 모바일 화면 크기 규칙은 이 컴포넌트에서만 처리한다.
 *
 * - 480px 이하(실제 폰): 프레임 없이 화면 전체(`w-full`, `h-dvh`)를 쓴다.
 * - 481px 이상: 화면 가운데에 `--app-width` × `--app-height` 크기의 프레임을 고정한다.
 *   브라우저 높이가 더 작으면 프레임 높이를 화면 높이에 맞춘다.
 * - body는 스크롤하지 않고, 내용이 길면 프레임 안의 `main`에서만 스크롤한다.
 * - 프레임은 `relative`라서 하단 버튼·탭바는 `fixed` 대신 프레임 안에서 `sticky`나 `absolute`로 붙인다.
 * - 노치와 홈 인디케이터를 피하도록 safe-area 여백을 프레임에 적용한다.
 * - lazy loading 중인 페이지는 로딩 상태를 표시한다.
 */
export const RootLayout = () => (
  <div className="flex h-dvh w-full overflow-hidden bg-surface preview:items-center preview:justify-center preview:bg-backdrop">
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-body preview:h-[min(var(--app-height),100dvh)] preview:w-(--app-width) preview:shadow-lg">
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Suspense
          fallback={
            <p role="status" className="m-auto text-muted">
              불러오는 중…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  </div>
)
