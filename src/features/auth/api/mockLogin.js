/**
 * 서버가 없을 때 쓰는 가짜 로그인. API가 확정되면 이 파일을 삭제한다.
 * 0.5초 뒤에 성공하며, 비밀번호가 6자 미만이면 실패한다.
 * @param {{username: string, password: string}} values 아이디와 비밀번호
 * @returns {Promise<{username: string}>} 로그인한 사용자 정보
 */
export const mockLogin = async ({ username, password }) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (password.length < 6) {
    throw new Error('아이디 또는 비밀번호가 맞지 않아요.')
  }
  return { username }
}
