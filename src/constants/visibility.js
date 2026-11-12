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
 * 게시글 비밀번호 길이 제한(6~64자).
 * TODO(API 확인 필요): API 명세는 8~64자다. 화면에서는 6자 이상으로 받기로 했으므로, 서버가 6~7자를 거절하지 않는지 백엔드와 맞춘다.
 */
export const POST_PASSWORD_LENGTH = { min: 6, max: 64 }
