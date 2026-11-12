/** 비밀번호 최소 길이 */
const PASSWORD_MIN_LENGTH = 6

/**
 * 비밀번호가 "영문, 숫자, 특수문자 포함 6자 이상" 조건을 만족하는지 확인한다.
 * @param {string} password 검사할 비밀번호
 * @returns {boolean} 조건을 만족하면 true
 */
export const isValidPassword = (password) =>
  password.length >= PASSWORD_MIN_LENGTH &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z\d]/.test(password)

/**
 * 회원가입 입력값을 검사해 필드별 오류 문구를 돌려준다. 오류가 없으면 빈 객체다.
 * @param {{password: string, passwordConfirm: string}} values 입력값
 * @returns {{password?: string, passwordConfirm?: string}} 필드별 오류 문구
 */
export const validateSignup = ({ password, passwordConfirm }) => {
  const errors = {}
  if (!isValidPassword(password)) {
    errors.password = '영문, 숫자, 특수문자를 포함해 6자 이상 입력해 주세요.'
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 서로 달라요.'
  }
  return errors
}
