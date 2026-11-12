# AGENTS.md

이 문서는 프론트엔드 개발자 두 명과 AI 코딩 도구가 함께 지키는 프로젝트 기본 규칙이다.
코드를 만들거나 고칠 때 항상 이 규칙을 따른다. 규칙과 다르게 해야 하는 상황이면 임의로 바꾸지 말고 먼저 팀원에게 확인한다.

> 한 줄 요약: 화면은 `pages/`, 기능은 `features/`, 공통 코드는 shared에 둔다.
> 작업은 `dev`에서 딴 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 `dev`에 병합한다.

관련 문서: [api-spec.md](docs/api-spec.md)(API 명세), [routes.md](docs/routes.md)(라우트), [development-workflow.md](docs/development-workflow.md)(개발 절차), [architecture.md](docs/architecture.md)(구조)

## 1. 기술 스택

| 영역                 | 사용 기술                                                                   |
| -------------------- | --------------------------------------------------------------------------- |
| 프레임워크           | React 19, JavaScript(`.js`, `.jsx`), Vite. TypeScript는 사용하지 않는다.    |
| 스타일               | Tailwind CSS 우선. 전역 디자인 토큰은 `src/index.css`에서 관리한다.         |
| 라우팅               | React Router. 도메인별로 라우트를 정의하고 페이지는 lazy loading한다.       |
| 서버 상태            | TanStack Query로 조회와 캐싱을 한다.                                        |
| 공유 클라이언트 상태 | Zustand. 로그인 UI, 필터, 모달처럼 여러 화면이 함께 쓰는 상태에만 사용한다. |
| HTTP                 | Axios 공통 `apiClient`(`src/lib/apiClient.js`)만 사용한다.                  |
| 테스트               | Vitest + React Testing Library (jsdom, jest-dom)                            |
| 경로 별칭            | `@/` = `src/`                                                               |

## 2. 폴더 구조

```text
프로젝트 루트/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── docs/
│   ├── api-spec.md
│   ├── architecture.md
│   ├── development-workflow.md
│   └── routes.md
├── package.json
├── vite.config.js
└── src/
    ├── assets/       # 이미지, 아이콘 등 정적 리소스
    ├── components/   # 여러 화면에서 재사용하는 공통 UI (shared)
    ├── constants/    # 여러 기능이 함께 쓰는 상수 (shared)
    ├── features/     # 기능별 코드 (예: 접수, 변론, 판결)
    ├── lib/          # apiClient, queryClient 등 공통 모듈 (shared)
    ├── pages/        # 주소마다 하나씩 있는 입구 파일
    ├── routes/       # 주소와 페이지를 잇는 라우트 정의
    ├── App.css
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

- "shared"는 `components/`, `constants/`, `lib/`와 필요할 때 추가하는 공통 `hooks/`를 묶어 부르는 이름이다. `shared/` 폴더는 따로 만들지 않는다.
- 라우트 폴더 이름은 `routes/`로 통일한다.

## 3. 아키텍처 규칙

- 의존 방향은 `pages → features → shared(components/hooks/lib/constants)`이다. 반대 방향 import는 금지한다.
- `pages/`는 라우트 연결, 라우트 파라미터 처리, feature 조합만 담당한다. 비즈니스 로직은 넣지 않는다.
- `features/{domain}/` 안에는 `api/`, `components/`, `hooks/`, `utils.js`, `index.js`를 둔다.
- feature 밖에서는 feature 내부 파일을 직접 import하지 않고 해당 feature의 `index.js`로만 import한다.
- 공통 레이어(shared)는 feature를 import하지 않는다.
- 위 import 규칙은 `eslint.config.js`의 `no-restricted-imports`로 검사한다.

## 4. 데이터 흐름 (임시: 디자인과 백엔드가 나오면 다시 정한다)

```text
apiClient → features/{domain}/api → TanStack Query hook → 화면 컴포넌트
```

- `VITE_API_BASE_URL`은 `/api/v1`까지 포함한다(예: `http://localhost:8080/api/v1`). `apiClient`는 이 값을 baseURL로 그대로 쓴다.
- `features/{domain}/api`에서는 `/cases`처럼 버전 뒤 경로만 적는다.
- 식별 헤더(`X-Demo-Id`)는 `apiClient`의 request interceptor 한 곳에서만 붙인다.
- 서버 데이터는 TanStack Query에서만 다룬다. Zustand에 서버 데이터를 복사하지 않는다.
- Mutation은 자동 재시도하지 않는다(`queryClient` 기본값 `retry: false`).
- API 세부 동작은 [api-spec.md](docs/api-spec.md)를 따른다. 명세에 없는 필드나 동작은 추측하지 말고 `// TODO(API 확인 필요)`를 남긴다.

## 5. 화면과 스타일 (모바일 웹)

앱이 아니라 웹으로 만들지만, 화면은 iPhone 18 Pro 기준의 모바일 화면처럼 보이게 한다.

- **기준 크기**: Figma 디자인 프레임의 실제 크기(width × height)를 쓴다. Figma 크기를 확인하기 전까지는 402 × 874를 쓴다.
- 크기 값은 `src/index.css`의 `--app-width`, `--app-height` 토큰 하나로만 정의하고, 코드 곳곳에 숫자를 하드코딩하지 않는다.
- **넓은 화면(481px 이상)**: 화면 가운데에 기준 크기의 프레임을 고정한다(너비·높이 모두 고정, 바깥 배경은 구분되는 색).
  - 내용이 길면 프레임 안에서만 스크롤한다. body는 스크롤하지 않는다.
  - 브라우저 높이가 프레임보다 작으면 프레임 높이를 `min(var(--app-height), 100dvh)`로 줄이고 안쪽 스크롤을 유지한다.
- **좁은 화면(480px 이하, 실제 폰)**: 프레임 없이 `w-full`, `h-dvh`로 화면 전체를 쓴다.
- 하단 고정 버튼, 탭바 같은 고정 요소는 `fixed`를 쓰지 않는다. 프레임 안에서 `sticky`나 `absolute`로 붙여 프레임 밖으로 나가지 않게 한다.
- 노치와 홈 인디케이터를 피하도록 `env(safe-area-inset-*)` 여백을 적용한다(`index.html` viewport에 `viewport-fit=cover`).
- 이 규칙은 `RootLayout` 하나에서만 처리한다. 모든 화면은 `RootLayout` 안에서 렌더링하고, 각 페이지는 프레임 크기를 신경 쓰지 않는다.
- 임의의 색이나 값보다 Tailwind와 `src/index.css`의 디자인 토큰을 먼저 쓴다.

## 6. 코드와 접근성 기준

- 핵심 함수, 컴포넌트, hook, API, 복잡한 로직에는 한글 `/** */` JSDoc을 작성한다.
- 함수는 화살표 함수 선언을 우선한다.
- 페이지 이동에는 `Link`를, 저장·검색·삭제 같은 실행에는 `button`을 쓴다.
- 아이콘 버튼에는 접근 가능한 이름(`aria-label`)을 붙이고, 클릭 영역은 44px 이상으로 한다.
- 로딩, 빈 상태, 오류 상태, 키보드 focus 표시를 항상 처리한다.

## 7. Git과 협업 규칙

### 로컬 작업

- 브랜치는 `main`, `dev`, 기능 브랜치로 나눈다.
  - 기능 브랜치는 최신 `dev`에서 딴다.
  - 브랜치 이름: `type/kebab-case-설명` (예: `feat/login-page`, `fix/auth-redirect`)
  - type은 허용 목록에서만 고른다: `feat`, `fix`, `design`, `style`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`
- 작업을 시작하기 전과 PR을 올리기 전에 최신 `dev`를 내 브랜치에 반영한다(rebase 또는 merge).
- 커밋 메시지: `type(scope): 변경 내용` (scope는 필수이고 kebab-case로 쓴다)
- Husky와 lint-staged가 커밋 전에 ESLint와 Prettier를 실행하고, Commitlint가 메시지 형식을 검사한다.
- PR을 올리기 전에 아래 4개를 반드시 통과시킨다.

  ```sh
  npm run format:check
  npm test
  npm run lint
  npm run build
  ```

### CI와 병합

- 기능 브랜치의 PR 대상은 `dev`다. `main`과 `dev`에는 직접 push하지 않는다.
- 릴리스할 때는 `dev → main` PR을 만들어 병합한다.
- 긴급 수정만 예외로 `main`에서 `fix/...` 브랜치를 따서 `main`에 PR을 올린다. 병합한 뒤에는 `main`을 `dev`에 다시 반영한다. (`hotfix`는 허용 type이 아니라서 쓰지 않는다.)
- CI(GitHub Actions)는 PR과 `dev`, `main` push에서 품질 검사만 한다: format, test, lint, build, commit-messages
- `main-protection`, `dev-protection` Ruleset이 직접 push, force push, 브랜치 삭제를 막는다. 병합 전에 PR 대화를 모두 해결하고 필수 검사를 통과해야 한다.
- 코드 리뷰에 GitHub Copilot 자동 리뷰는 쓰지 않는다. 필요하면 Codex에 수동으로 요청한다.

### 배포

- 배포는 Vercel이 맡는다. Actions에 배포 workflow는 만들지 않는다.
  - 기능 브랜치 push와 PR: Preview
  - `dev`: Preview (팀 공용 확인용)
  - `main` 병합: Production
- `dev`에서 확인 → `main` 병합 시 Production 배포

## 8. 두 명이 함께 일할 때 지킬 것

- 한 브랜치는 기능(도메인) 하나만 다루고 작게 유지한다. 서로 다른 `features/{domain}`을 나눠 맡아 충돌을 줄인다.
- 공통 영역(`components/`, `constants/`, `lib/`, `routes/`, `src/index.css`, `RootLayout`, `apiClient`, 설정 파일)을 고칠 때는 "동료와 공유가 필요한 변경"이라고 알리고, 가능하면 별도 PR로 나눈다.
- 라우트 주소와 이름은 [routes.md](docs/routes.md)가 기준이다. 라우트를 추가하면 `docs/routes.md`도 함께 갱신한다.
  - URL은 피그마 `화면 이동` 페이지를 기준으로 정한다. `docs/api-spec.md`는 동적 파라미터 이름과 검색 파라미터를 맞추는 데만 쓴다.
  - 게시판 검색은 `GET /board/posts`의 쿼리 파라미터 `tag`, `q`를 그대로 쓴다.
  - 확정되지 않은 동적 파라미터는 `docs/routes.md` 표에 "API 확인 필요"라고 적고, 코드에는 `// TODO(API 확인 필요)`를 남긴다.

## 9. 피그마 → 코드 규칙

- 화면은 Figma MCP로 디자인 정보를 가져와서 구현한다. 스크린샷만 보고 추측하지 않는다.
- Figma 변수(색, 간격, 폰트, radius)는 `src/index.css` 토큰으로 옮기고, 임의 값을 하드코딩하지 않는다.
- `components/`에 이미 있는 공용 부품은 새로 만들지 않고 재사용한다.
- Figma가 내주는 코드는 참고용이다. 그대로 붙이지 말고 폴더 구조, 의존 방향, 접근성 규칙에 맞게 고친다.
- 디자인 기준 크기는 Figma 프레임 크기(iPhone 18 Pro 기준)이며, 값은 `src/index.css`의 `--app-width`, `--app-height` 토큰을 따른다.
