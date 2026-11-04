# **프론트엔드 아키텍처 및 개발 워크플로우 정리**

프레임워크 : React, JavaScript, Vite
스타일 : Tailwind CSS
배포 : Vercel

# 협업

화면은 pages/, 기능은 features/, 공통 코드는 shared/에 둔다.
작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.

### 데이터 흐름 :apiClient → features/{domain}/api → TanStack Query hook → 화면 컴포넌트

서버 데이터는 TanStack Query(조회), 화면 상태는 Zustand(필터)로 관리 Mutation(수정*재시도X)

## 화면과 스타일

- 모든 화면은 `RootLayout`에서 렌더링
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
> 작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.

작업은 브랜치에서 하고, 검사와 PR 확인을 마친 뒤 병합한다.
