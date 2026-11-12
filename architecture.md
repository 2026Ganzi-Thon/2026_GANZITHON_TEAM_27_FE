# 프론트엔드 아키텍처

React 19, JavaScript(`.js`, `.jsx`), Vite를 사용합니다. 규칙의 기준은 [AGENTS.md](AGENTS.md)이고, 이 문서는 현재 구조를 설명합니다.

## 파일 구조

```text
src/
  assets/      # 이미지, 아이콘 등 정적 리소스
  components/  # 여러 화면에서 재사용할 공통 UI (layout/RootLayout.jsx 포함)
  constants/   # 여러 기능에서 함께 쓰는 상수
  features/    # 접수, 변론, 판결 등 기능별 코드
  lib/         # apiClient, queryClient, 체험 ID 등 공통 모듈
  pages/       # 기능과 컴포넌트를 조합하는 화면
  routes/      # 페이지 주소(paths.js), lazy 페이지(lazyPages.js), 라우트 트리(router.jsx)
  App.css
  App.jsx      # QueryClientProvider + RouterProvider
  index.css    # Tailwind 진입점과 전역 디자인 토큰
  main.jsx
```

- shared는 `components/`, `constants/`, `lib/`와 필요할 때 추가하는 `hooks/`를 묶어 부르는 이름입니다. `shared/` 폴더는 만들지 않습니다.
- 의존 방향은 `pages → features → shared`입니다. ESLint `no-restricted-imports`로 검사합니다.
- 빈 폴더는 `.gitkeep`으로 Git에 남깁니다. 코드가 생기면 삭제합니다.
- `@/`는 `src/`를 가리킵니다. Vite와 편집기 설정(`jsconfig.json`)에 동일하게 적용합니다.

## 연결된 기본 구성

- **라우터**: `createBrowserRouter`로 모든 페이지를 `RootLayout` 안에서 lazy loading합니다. 정의되지 않은 주소는 `NotFoundPage`, 렌더링 오류는 `RouteErrorPage`가 처리합니다. 주소 기준은 [routes.md](routes.md)입니다.
- **TanStack Query**: `src/lib/queryClient.js`. mutation 기본값은 `retry: false`입니다.
- **Axios `apiClient`**: `src/lib/apiClient.js`. `VITE_API_BASE_URL`(`/api/v1` 포함)을 baseURL로 그대로 쓰고, request interceptor에서 `X-Demo-Id` 헤더를 붙입니다.
- **Zustand**: 설치만 했습니다. 여러 화면이 공유하는 UI 상태가 생길 때 스토어를 만듭니다.
- **테스트**: Vitest + React Testing Library(jsdom). 설정은 `vite.config.js`의 `test`와 `vitest.setup.js`에 있습니다.

## 화면과 스타일

Tailwind CSS를 `src/index.css`에 연결했습니다. 전역 색상·크기 토큰은 이 파일에서 관리합니다.

앱이 아니라 웹이지만, 화면은 iPhone 18 Pro 기준의 모바일 화면처럼 보이게 합니다. 이 규칙은 `RootLayout` 하나에서만 처리하고 각 페이지는 프레임 크기를 신경 쓰지 않습니다.

- **기준 크기**: `src/index.css`의 `--app-width`, `--app-height` 토큰으로만 정의합니다. 지금은 402 × 874이며, Figma 디자인 프레임 크기를 확인하면 그 값으로 교체합니다.
- **넓은 화면(481px 이상)**: 화면 가운데에 기준 크기의 프레임을 고정하고 바깥 배경은 `backdrop` 색으로 구분합니다.
  - 내용이 길면 프레임 안(`main`)에서만 스크롤하고 body는 스크롤하지 않습니다.
  - 브라우저 높이가 프레임보다 작으면 프레임 높이를 `min(var(--app-height), 100dvh)`로 줄입니다.
- **좁은 화면(480px 이하)**: 프레임 없이 `w-full`, `h-dvh`로 화면 전체를 씁니다.
- **고정 요소**: 프레임이 `relative`이므로 하단 버튼·탭바는 `fixed` 대신 `sticky`나 `absolute`로 프레임 안에 붙입니다.
- **safe area**: 프레임에 `env(safe-area-inset-*)` 여백을 적용하고, `index.html` viewport에 `viewport-fit=cover`를 넣었습니다.
- 481px 전환점은 Tailwind 커스텀 breakpoint `preview:`로 씁니다.
