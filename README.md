# **프론트엔드 아키텍처 및 개발 워크플로우 정리**

**작성자:** [배서현]

**목표:** 프로젝트 기본 구조 및 협업 컨벤션 숙지, 기능 개발 전 설계 일관성 확보

---

# **README.MD**

---

# **프론트엔드 아키텍처 (`architecture.md`)**

## 계층과 의존성

```
pages → features → shared components/hooks/lib/constants
```

- `pages/`는 라우트 연결, 라우트 파라미터 처리, feature 조합만 담당한다.
- `features/{domain}/`은 도메인별 `api/`, `components/`, `hooks/`, `utils.js`, `index.js`를 둔다.
- feature 외부에서는 내부 파일이 아닌 `index.js`로만 import한다.
- 공통 레이어는 feature를 import하지 않는다.

## 데이터 흐름

```
apiClient → features/{domain}/api → TanStack Query hook → 화면 컴포넌트
```

- 서버 데이터는 TanStack Query가 조회·캐싱한다.
- Zustand는 필터, 모달, 로그인 UI처럼 여러 화면에서 공유하는 클라이언트 상태만 가진다.
- Mutation은 기본적으로 자동 재시도하지 않는다.

## 화면과 스타일

- 모든 화면은 `RootLayout`에서 렌더링한다.
- `480px` 이하는 `w-full`, `min-h-dvh`를 쓰며 전체 뷰포트를 사용한다.
- `481px` 이상은 중앙의 최대 폭 `390px`, 최소 높이 `844px` 미리보기를 유지한다.
- Tailwind CSS와 `src/index.css`의 디자인 토큰을 우선 사용한다.

## 코드·접근성 기준

- 핵심 함수·컴포넌트·hook·API·복잡한 기능에는 한글 `/** */` JSDoc을 작성한다.
- 화살표 함수 선언을 우선한다.
- 이동은 `Link`, 실행은 `button`을 사용한다.
- 아이콘 버튼의 접근 가능한 이름, 44px 이상의 클릭 영역, 로딩·빈·오류 상태, 키보드 focus를 확인한다.

---

### 

# 개발 품질 및 Git 워크플로 (development-workflow.md)

## 로컬 작업

- 브랜치는 `feat/login-page`, `fix/auth-redirect`처럼 type과 kebab-case 설명을 조합한다.
- 커밋은 `feat(scope): 변경 내용` 형식이며 scope는 kebab-case다.
- 허용 type: `feat`, `fix`, `design`, `style`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`.
- Husky와 lint-staged는 커밋 전에 ESLint·Prettier를, Commitlint는 메시지 형식을 검사한다.

## PR 전 검증

```bash
npm run format:check
npm test
npm run lint
npm run build
```

## CI와 병합

- PR과 `main` push에서 `format`, `test`, `lint`, `build`, `commit-messages` 검사를 실행한다.
- `main-protection` Ruleset은 직접 push, force push, 브랜치 삭제를 막는다.
- 병합 전 모든 PR 대화를 해결하고 필수 status check를 통과한다.
- GitHub Copilot 자동 코드 리뷰는 사용하지 않는다. 리뷰가 필요하면 Codex에 수동으로 요청한다.

## 배포

- feature branch push 또는 PR 생성 시 Vercel Preview를 배포한다.
- `main` 병합 시 Vercel Production을 배포한다.
- GitHub Actions는 품질 검사만 맡으며, 별도 Actions 배포 workflow는 만들지 않는다.

---

# 초기 라우트 구조 (routes.md)

피그마의 `화면 이동` 페이지에서 확인한 화면을 기준으로 URL을 구성했다. 현재 각 페이지는 구현 전 선언만 되어 있으며, 모두 `RootLayout` 안에서 렌더링된다.

| 피그마 화면 | URL | 페이지 |
| --- | --- | --- |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

`searchType`에는 `name`, `author`, `isbn`을 사용한다. 실제 API 명세가 확정되면 동적 파라미터와 URL 이름을 함께 조정한다.

---

# <지킬거>

화면은 pages/, 기능은 features/, 공통 코드는 shared/에 둔다.
작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.

### 코드 구조:  pages → features → shared components/hooks/lib/constants

- `pages :` 라우트 연결, 라우트 파라미터 처리, feature 조합만 담당
- `features/{domain}/ :`도메인별 `api/`, `components/`, `hooks/`, `utils.js`, `index.js`를 둔다.
- feature 외부 : 내부 파일이 아닌 `index.js`로만 import한다.
- 공통 레이어는 feature를 import (X)

### 데이터 흐름 :apiClient → features/{domain}/api → TanStack Query hook → 화면 컴포넌트

서버 데이터는 TanStack Query(조회), 화면 상태는 Zustand(필터)로 관리 Mutation(수정*재시도X)

## 화면과 스타일

- 모든 화면은 `RootLayout`에서 렌더링
- `480px` 이하 :  `w-full(너비 꽉 채움)`, `min-h-dvh(높이 최소 채움)`를 쓰며 전체 뷰포트를 사용
- `481px` 이상 :  중앙의 최대 폭 `390px`, 최소 높이 `844px` 미리보기를 유지
- Tailwind CSS와 `src/index.css`의 디자인 토큰을 우선 사용

## 코드·접근성 기준

- 핵심 함수·컴포넌트·hook·API·복잡한 기능에는 한글 `/** */` JSDoc을 작성한다.
- 화살표 함수 선언을 우선한다.
- 화면 이동: `Link (페이지 이동)`, 실행 : `button (ex 저장,검색,삭제)`
- 아이콘 버튼의 접근 가능한 이름, 44px 이상의 클릭 영역, 로딩·빈·오류 상태, 키보드 focus를 확인한다.

### 작업과 협업

- 작업은 브랜치를 만들어 진행한다. 예: `feat/login-page`
- 커밋은 `feat(scope): 변경 내용` 형식으로 작성한다.
- 허용 type: `feat`, `fix`, `design`, `style`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`.
- PR 전에 아래 검사를 실행한다.
    - `format:check`: 코드 모양 확인
    - `test`: 기능 시험
    - `lint`: 코드 실수 확인
    - `build`: 실행 가능한 상태로 만들어지는지 확인

```
npm run format:check
npm test
npm run lint
npm run build
```

- PR 검토와 필수 검사가 끝난 뒤 병합한다. `main`에 직접 push하지 않는다.
- 기능 브랜치와 PR은 미리보기로 확인하고, `main` 병합 후 실제 배포한다.

## 라우트 참고

화면 주소와 이름은 `routes.md`를 확인

> :화면은 `pages/`, 기능은 `features/`, 공통 코드는 `shared/`에 둔다.
> 
> 
> 작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.
> 

작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.
