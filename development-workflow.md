# 개발 및 검증 절차

## 로컬 개발

- 팀 공통 Node 버전은 `.nvmrc`의 24이며, 패키지 최소 요구 조건은 Node 24 이상·npm 11 이상입니다.
- `package-lock.json`을 함께 관리하고, 체크아웃 후 `npm ci`로 설치합니다.
- `npm run dev`로 개발 서버를 실행합니다.
- `npm run build` 후 `npm run preview`로 배포용 결과를 로컬에서 확인할 수 있습니다.

## 브랜치와 커밋

- 작업 브랜치는 `feat/login-page`, `chore/project-setup`처럼 type과 kebab-case 설명을 조합합니다.
- 커밋은 `feat(login-page): 로그인 화면 추가`처럼 `type(scope): 내용` 형식으로 작성합니다.
- scope는 비어 있을 수 없고 kebab-case를 사용합니다.
- 허용 type은 `feat`, `fix`, `design`, `style`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`입니다.
- Husky의 `pre-commit`에서 lint-staged를 실행해 변경된 JS·JSX의 ESLint와 지원 파일의 Prettier를 검사·수정합니다.
- `commit-msg`에서는 Commitlint로 커밋 메시지를 검사합니다.
- `npm ci` 또는 `npm install`의 `prepare` 단계에서 훅을 설치합니다. 다시 설치하려면 `npm run prepare`를 실행합니다.
- `git config --get core.hooksPath` 결과가 `.husky/_`이면 훅이 연결된 상태입니다.
- `.git` 쓰기 권한이 없는 환경에서는 훅이 활성화되지 않을 수 있습니다. 이때도 아래 검사는 직접 실행할 수 있습니다.

## 변경 후 검사

```sh
npm run format:check
npm run lint
npm run build
```

전체 검사는 `npm run check`, 코드 포맷 수정은 `npm run format`를 사용합니다.

ESLint와 `@eslint/config-array`가 사용하는 `minimatch`는 [공개된 보안 권고](https://github.com/advisories/GHSA-g3hv-75wg-m249)의 수정 버전인 11.0.1 이상으로 제한해 override합니다. 다른 패키지의 의존성에는 적용하지 않습니다. ESLint가 수정된 버전을 직접 포함하게 되면 override 제거 후 설치와 린트를 다시 확인합니다.

## CI 및 원격 설정

`.github/workflows/quality.yml`은 로컬에 준비한 품질 검사 설정입니다. GitHub에 반영되면 PR과 `main` push에서 `format`, `lint`, `build`, `commit-messages` 검사를 실행합니다. 배포 작업은 포함하지 않습니다.

GitHub 브랜치 보호 규칙과 Vercel 프로젝트 연결은 별도 원격 설정입니다. 이번 로컬 작업에서는 구성하거나 배포하지 않습니다. 원격 작업 시 다음 항목을 확인합니다.

- `main`은 PR로 병합하고 필수 검사와 PR 대화 해결을 요구합니다.
- `main-protection` Ruleset으로 직접 push, force push, 브랜치 삭제를 제한합니다.
- Vercel Preview와 Production의 연결 및 환경 변수는 실제 배포 전에 확인합니다.
- GitHub Actions는 품질 검사만 담당하고 별도 Actions 배포 workflow는 만들지 않습니다.
- GitHub Copilot 자동 코드 리뷰는 사용하지 않습니다. 필요한 경우 Codex에 수동 리뷰를 요청합니다.
