# 2026 GANZITHON TEAM 27 Frontend

작성자: 배서현

React 19·JavaScript·Vite 기반 웹 프론트엔드입니다. 팀 가이드에 맞춘 로컬 개발 구조와 공통 설정을 포함합니다. 현재 홈 화면은 기존 시작 예제이며 제품 화면과 서버 API는 아직 연결하지 않았습니다.

## 로컬 실행

팀 기준 Node 버전은 `.nvmrc`의 24입니다. Node 24 이상과 npm 11 이상에서 실행합니다.

```sh
npm ci
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다. 개발 서버의 기본 주소는 `http://localhost:5173`입니다.

## 기본 기술

| 영역                                  | 구성                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| 프레임워크                            | React 19, JavaScript (`.js`, `.jsx`), Vite                                     |
| 스타일                                | Tailwind CSS 4, `src/index.css`의 공통 토큰                                    |
| 라우팅·서버 상태·클라이언트 상태·HTTP | React Router, TanStack Query, Zustand, Axios 설치만 완료 (연결은 기능 개발 때) |
| 경로 별칭                             | `@/` → `src/` (Vite와 편집기에 동일 적용)                                      |
| 코드 검사                             | ESLint, Prettier                                                               |
| 커밋 검사                             | Husky, lint-staged, Commitlint                                                 |

## 파일 구조

```text
src/
  assets/      # 이미지, 아이콘 등 정적 리소스
  components/  # 여러 화면에서 재사용할 공통 UI
  constants/   # 여러 기능에서 함께 쓰는 상수
  features/    # 접수, 변론, 판결 등 기능별 코드
  pages/       # 기능과 컴포넌트를 조합하는 화면
  routes/      # 페이지 주소와 라우트 정의
  App.css
  App.jsx
  main.jsx
  index.css  # Tailwind 진입점과 전역 디자인 토큰
```

공통 `hooks/`, `lib/`는 실제 코드가 생길 때 추가합니다.

## API 주소

필요할 때 `.env.example`을 `.env.local`로 복사해 `VITE_API_BASE_URL`을 실제 백엔드 주소로 변경합니다. 미설정 시 `/api`를 사용합니다.

현재 백엔드나 개발 프록시는 연결하지 않았으며 홈 화면에서 API 요청을 보내지 않습니다. `VITE_` 환경 변수는 브라우저에 공개되므로 비밀 키를 넣지 않습니다. 새 설정은 개발 서버를 재시작하면 반영됩니다.

## 검사 명령

```sh
npm run format:check
npm run lint
npm run build
```

전체 검사는 `npm run check`, 포맷 수정은 `npm run format`을 사용합니다. `npm run preview`는 빌드된 결과를 로컬에서 보여줍니다.

Git 훅은 설치 시 `prepare` 단계에서 연결합니다. `.git` 쓰기 권한이 제한되면 활성화되지 않을 수 있으므로 [개발 절차](./development-workflow.md)의 확인 방법을 참고하세요.

## 팀 문서

- [아키텍처와 공통 원칙](./architecture.md)
- [개발·커밋·검증 절차](./development-workflow.md)

품질 검사 workflow는 로컬 파일로 준비되어 있습니다. GitHub 브랜치 보호 설정과 Vercel 연결·배포는 이번 로컬 설정 범위에 포함하지 않았습니다.
