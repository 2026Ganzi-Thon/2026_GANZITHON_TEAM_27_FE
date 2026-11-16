/**
 * 게시글 공개 범위. 값은 API의 게시글 `visibility`와 같다.
 * - `public`: 전체 공개
 * - `password_protected`: 비공개(비밀번호를 입력해야 볼 수 있음)
 */
export const VISIBILITY = {
  public: 'public',
  passwordProtected: 'password_protected',
}

/**
 * 게시글 비밀번호 길이 제한(6~64자). 백엔드(`POST /cases/{id}/posts`, `POST /board/posts`)도 6~64자를 받는다.
 */
export const POST_PASSWORD_LENGTH = { min: 6, max: 64 }
