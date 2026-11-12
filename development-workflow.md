# 개발 및 검증 절차

## 로컬 작업

### 환경

- 팀 공통 Node 버전은 `.nvmrc`의 24이며, 패키지 최소 요구 조건은 Node 24 이상·npm 11 이상입니다.
- `package-lock.json`을 함께 관리하고, 체크아웃 후 `npm ci`로 설치합니다.
- `.env.example`을 참고해 `.env.local`에 `VITE_API_BASE_URL`을 설정합니다. 이 값은 `/api/v1`까지 포함합니다(예: `http://localhost:8080/api/v1`).
- `npm run dev`로 개발 서버를 실행합니다.
- `npm run build` 후 `npm run preview`로 배포용 결과를 로컬에서 확인할 수 있습니다.

### 브랜치

| 브랜치          | 역할                 | 어디서 따는가 | PR 대상 |
| --------------- | -------------------- | ------------- | ------- |
| `main`          | Production 배포 기준 | —             | —       |
| `dev`           | 팀 통합·확인용       | `main`        | `main`  |
| 기능 브랜치     | 기능 하나 단위 작업  | `dev`         | `dev`   |
| `fix/...`(긴급) | Production 긴급 수정 | `main`        | `main`  |

- 브랜치 이름은 `type/kebab-case-설명` 형식입니다(예: `feat/login-page`, `chore/project-setup`).
- type은 허용 목록에서만 고릅니다: `feat`, `fix`, `design`, `style`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`. `hotfix`는 허용 type이 아니므로 긴급 수정도 `fix/...`를 씁니다.
- 작업을 시작하기 전과 PR을 올리기 전에 최신 `dev`를 내 브랜치에 반영합니다.

```sh
git switch dev
git pull
git switch -c feat/login-page   # 새 작업 시작

git fetch origin
git rebase origin/dev           # 또는 git merge origin/dev
```

### 커밋

- 커밋은 `feat(login-page): 로그인 화면 추가`처럼 `type(scope): 내용` 형식으로 작성합니다.
- scope는 비어 있을 수 없고 kebab-case를 사용합니다.
- Husky의 `pre-commit`에서 lint-staged를 실행해 변경된 JS·JSX의 ESLint와 지원 파일의 Prettier를 검사·수정합니다.
- `commit-msg`에서는 Commitlint로 커밋 메시지를 검사합니다.
- `npm ci` 또는 `npm install`의 `prepare` 단계에서 훅을 설치합니다. 다시 설치하려면 `npm run prepare`를 실행합니다.
- `git config --get core.hooksPath` 결과가 `.husky/_`이면 훅이 연결된 상태입니다.
- `.git` 쓰기 권한이 없는 환경에서는 훅이 활성화되지 않을 수 있습니다. 이때도 아래 검사는 직접 실행할 수 있습니다.

### PR 전 검사

```sh
npm run format:check
npm test
npm run lint
npm run build
```

- 전체 검사는 `npm run check`, 코드 포맷 수정은 `npm run format`를 사용합니다.
- 테스트는 Vitest와 React Testing Library를 씁니다. `npm test`는 1회 실행, `npm run test:watch`는 watch 모드입니다. 테스트 파일은 `src/**/*.test.{js,jsx}`로 대상 코드 옆에 둡니다.

ESLint와 `@eslint/config-array`가 사용하는 `minimatch`는 [공개된 보안 권고](https://github.com/advisories/GHSA-g3hv-75wg-m249)의 수정 버전인 11.0.1 이상으로 제한해 override합니다. 다른 패키지의 의존성에는 적용하지 않습니다. ESLint가 수정된 버전을 직접 포함하게 되면 override 제거 후 설치와 린트를 다시 확인합니다.

## CI와 병합

- `.github/workflows/quality.yml`은 PR과 `dev`, `main` push에서 `format`, `test`, `lint`, `build`, `commit-messages` 검사를 실행합니다.
- GitHub Actions는 품질 검사만 담당하고, 배포 workflow는 만들지 않습니다.
- 병합 흐름
  1. 기능 브랜치 → `dev` PR
  2. 릴리스할 때 `dev` → `main` PR
  3. 긴급 수정만 `main`에서 딴 `fix/...` → `main` PR. 병합한 뒤 `main`을 `dev`에 다시 반영합니다.
- 병합 조건: 필수 status check 통과, 모든 PR 대화 해결.
- GitHub Copilot 자동 코드 리뷰는 사용하지 않습니다. 필요한 경우 Codex에 수동 리뷰를 요청합니다.

### 브랜치 보호 Ruleset

`main-protection`과 `dev-protection`을 같은 기준으로 설정합니다. GitHub의 Settings → Rules → Rulesets에서 직접 설정합니다.

| 항목                                  | `main-protection`                                    | `dev-protection` |
| ------------------------------------- | ---------------------------------------------------- | ---------------- |
| Enforcement status                    | Active                                               | Active           |
| Target branches                       | `main`                                               | `dev`            |
| Bypass list                           | 없음                                                 | 없음             |
| Restrict deletions                    | 켬                                                   | 켬               |
| Block force pushes                    | 켬                                                   | 켬               |
| Require a pull request before merging | 켬                                                   | 켬               |
| Require conversation resolution       | 켬                                                   | 켬               |
| Require status checks to pass         | 켬                                                   | 켬               |
| 필수 status check                     | `format`, `test`, `lint`, `build`, `commit-messages` | 동일             |

- status check 이름은 workflow가 한 번 실행된 뒤에 검색 목록에 나타납니다.
- `test` 검사는 새로 추가됐으므로 기존 `main-protection`의 필수 검사에도 추가합니다.

## 배포

- 배포는 Vercel이 맡습니다.

| 이벤트               | 배포 환경                |
| -------------------- | ------------------------ |
| 기능 브랜치 push, PR | Preview                  |
| `dev` push           | Preview (팀 공용 확인용) |
| `main` 병합          | Production               |

- `dev`에서 확인 → `main` 병합 시 Production 배포
- Vercel Preview와 Production의 환경 변수(`VITE_API_BASE_URL`)는 실제 배포 전에 확인합니다.
