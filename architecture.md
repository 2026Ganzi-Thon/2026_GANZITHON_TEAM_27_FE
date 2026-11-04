# 프론트엔드 아키텍처

React 19, JavaScript(`.js`, `.jsx`), Vite를 사용합니다. 현재는 폴더 구조와 개발 환경만 세팅한 상태이며 화면·기능·API는 이후 개발합니다.

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
  index.css    # Tailwind 진입점과 전역 디자인 토큰
  main.jsx
```

- 빈 폴더는 `.gitkeep`으로 Git에 남깁니다. 코드가 생기면 삭제합니다.
- 공통 `hooks/`, `lib/`는 실제로 넣을 코드가 생길 때 만듭니다.
- `@/`는 `src/`를 가리킵니다. Vite와 편집기 설정(`jsconfig.json`)에 동일하게 적용합니다.

## 설치만 완료된 패키지

React Router, TanStack Query, Zustand, Axios는 설치만 했습니다. 라우터 설정, Query Provider, Zustand 스토어, Axios `apiClient`는 기능을 개발할 때 연결합니다.

## 스타일

Tailwind CSS를 `src/index.css`에 연결했습니다. 전역 색상·글꼴·그림자 토큰은 이 파일에서 관리합니다.
