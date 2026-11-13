# 라우트

화면 주소와 이름의 기준 문서다. 라우트를 추가하거나 바꾸면 이 문서와 `src/routes/paths.js`를 함께 갱신한다.

- URL은 피그마 `화면 이동` 페이지를 기준으로 정한다.
- [api-spec.md](api-spec.md)는 동적 파라미터 이름과 검색 파라미터를 맞추는 데만 쓴다.
- 확정되지 않은 동적 파라미터는 비고에 "API 확인 필요"라고 적고, 코드에는 `// TODO(API 확인 필요)`를 남긴다.
- 모든 페이지는 `RootLayout` 안에서 lazy loading으로 렌더링한다(`src/routes/lazyPages.js` → `src/routes/router.jsx`).

## 라우트 표

| 화면         | 주소                         | 페이지 컴포넌트       | 동적 파라미터            | 비고                                                                                                                        |
| ------------ | ---------------------------- | --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 홈           | `/`                          | `HomePage`            | —                        | 진행 중인 사건이 있으면 재방문 모습(이어하기 카드)으로 바뀜                                                                 |
| 로그인       | `/login`                     | `LoginPage`           | —                        | 주소는 피그마 `화면 이동` 확인 필요                                                                                         |
| 회원가입     | `/signup`                    | `SignupPage`          | —                        | 주소는 피그마 `화면 이동` 확인 필요                                                                                         |
| 동의         | `/consent`                   | `ConsentPage`         | —                        | 주소는 피그마 `화면 이동` 확인 필요                                                                                         |
| 사건 접수    | `/cases/new`                 | `CaseIntakePage`      | —                        | 홈에서 진입. 주소는 피그마 `화면 이동` 확인 필요                                                                            |
| 사건 카드    | `/cases/:caseId/card`        | `CaseCardPage`        | `caseId` (API 확인 필요) | 사건 종결 후 진입. `/cases/sample/card`는 예시 사건으로 계속 유지(확인용)                                                   |
| 게시판 공유  | `/cases/:caseId/share`       | `CommunitySharePage`  | `caseId` (API 확인 필요) | 공개 범위와 비밀번호 설정. `/cases/sample/share`는 예시 사건으로 계속 유지(확인용)                                          |
| 게시 완료    | `/community/shared`          | `CommunitySharedPage` | —                        | 게시 후 진입. 확인을 누르면 게시판으로 이동                                                                                 |
| community    | `/community`                 | `CommunityPage`       | —                        | 하단 탭바. 게시판. 내용은 피그마 확인 후 교체                                                                               |
| court        | `/court`                     | `CourtPage`           | —                        | 하단 탭바. 접수한 사건파일 전체 목록(사건 목록)                                                                             |
| 기소         | `/cases/:caseId/prosecution` | `ProsecutionPage`     | `caseId` (API 확인 필요) | 피그마 `2-1 기소`. `/cases/sample/prosecution`은 목업 사건(확인용)                                                          |
| 변론         | `/cases/:caseId/defense`     | `DefensePage`         | `caseId` (API 확인 필요) | 피그마 `Ai챗봇`. 기소 화면 "변론 시작"에서 진입. `/cases/sample/defense`는 목업 사건(확인용)                                |
| 판결         | `/cases/:caseId/decision`    | `DecisionPage`        | `caseId` (API 확인 필요) | 피그마 `2-4 판결`. 변론 화면 "변론 종료"에서 진입. 화면이 열릴 때 판결 초안(`POST /cases/{caseId}/decision`)을 요청         |
| 감정 변화    | `/cases/:caseId/emotion`     | `EmotionChangePage`   | `caseId` (API 확인 필요) | 피그마 `2-6 감정변화`. 판결 화면 "사건파일 저장하기"에서 진입. "다음"에서 판결을 확정(`PUT /cases/{caseId}/decision/final`) |
| 찾을 수 없음 | `*`                          | `NotFoundPage`        | —                        | 정의되지 않은 모든 주소                                                                                                     |

<!-- TODO(피그마 확인 필요): 피그마 `화면 이동` 페이지의 화면 주소를 이 표에 추가한다. -->

## 검색 파라미터

| 화면        | 쿼리 파라미터 | 값              | 기준 API           |
| ----------- | ------------- | --------------- | ------------------ |
| 게시판 검색 | `tag`         | 태그(1~24자)    | `GET /board/posts` |
| 게시판 검색 | `q`           | 검색어(1~100자) | `GET /board/posts` |
