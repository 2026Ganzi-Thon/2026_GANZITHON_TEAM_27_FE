# 게시판 상세 연결

목록 `/community/posts`와 메인 `/community`의 글은 `/community/:postId`로 이동한다.
검정 연필은 `/community/write`, 비공개 선택은 `/community/write/private`로 이동한다.
비공개 설정은 글쓰기 하위 라우트이며 push로 진입한다. 뒤로 돌아오면 부모의 제목·본문이 유지된다.
비밀번호는 하위 화면을 닫으면 제거된다. 새로고침 시 미제출 입력은 복원하지 않는다.

## 백엔드 전달 사항

요청은 `GET {VITE_API_BASE_URL}/board/posts/{pid}`이며 본문은 없다.
baseURL에는 `/api/v1`이 포함되고, 공통 Axios interceptor가 `X-Demo-Id`를 붙인다.

아래는 **기존 화면이 기대하는 모델 예시이며, 확정된 서버 계약이 아니다.**
서버 응답은 이 객체 자체 또는 `{ "data": { ... } }` 형태를 처리한다.

```json
{
  "title": "게시글 제목",
  "content": "게시글 본문",
  "author": "익명",
  "created_at_label": "2시간 전",
  "like_count": 24,
  "is_liked": false,
  "is_bookmarked": false,
  "comment_count": 1,
  "comments": [
    {
      "id": "comment-id",
      "author": "익명",
      "content": "댓글 본문",
      "created_at_label": "1시간 전",
      "like_count": 0
    }
  ]
}
```

응답 필드 확정 후 `src/api/mapBoardPost.js`의 매핑만 수정한다.
없는 필드는 undefined로 유지하며 시간·공감 수·댓글 수를 더미 데이터로 채우지 않는다.
빈 본문은 안내와 재시도, 요청 실패는 오류와 재시도, HTTP 404는 열람 불가 안내로 처리한다.

목록 조회와 글 등록은 기존 목업을 유지한다. 따라서 목업 목록의 ID로 상세 진입 시 서버에
해당 게시글이 없다면 404 안내가 표시된다. 실제 목록 API 응답 필드와 등록에 필요한 사건 ID는 확인이 필요하다.
좋아요·댓글·비밀번호 해제 API의 미확정 동작은 이번 작업에서 새로 정의하지 않는다.

## 종결 화면

`/cases/:caseId/closing`의 두 카드를 제거했다. 중앙 안내는 진입 시 24px 아래에서
0.9초 ease-out으로 한 번 나타나며, 동작 줄이기 설정에서는 애니메이션을 생략한다.
확인 버튼은 기존처럼 `/cases/:caseId/summary`로 이동한다.

## 변경 파일

- 추가: `src/api/mapBoardPost.js`, `src/api/mapBoardPost.test.js`, `src/pages/BoardNavigation.test.jsx`, 이 문서.
- 페이지 수정(`src/pages/`): `CommunityPage.jsx`, `CommunityPostsPage.jsx`, `BoardDetailPage.jsx`, `BoardWritePage.jsx`, `BoardWritePrivatePage.jsx`, `CaseClosingPage.jsx`, `CaseClosingSummary.test.jsx`.
- 게시판 수정(`src/features/board/`): `api/board.js`, `hooks/useBoard.js`, `hooks/useBoardWrite.js`, `components/BoardActionBar.jsx`, `components/BoardCommentSection.jsx`, `components/BoardDetailView.jsx`, `components/BoardPostContent.jsx`, `components/BoardWriteView.jsx`.
- 목록 수정(`src/features/community/components/`): `FeedItem.jsx`, `FeedSection.jsx`, `HotIssueCard.jsx`, `PostListSection.jsx`, `PostMenu.jsx`, `PostRow.jsx`, `WriteButton.jsx`.
- 종결 수정: `src/features/closing/components/ClosingView.jsx`, `src/features/closing/Closing.test.jsx`.
- 공통 수정: `src/index.css`, `src/routes/paths.js`, `src/routes/lazyPages.js`, `src/routes/router.jsx`, `docs/routes.md`.
- 삭제: `src/features/closing/components/ClosingCard.jsx`, `src/assets/closing/icon-emotion.svg`, `src/assets/closing/icon-summary.svg`.
