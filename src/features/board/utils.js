import { POST_PASSWORD_LENGTH } from '@/constants/visibility'

/**
 * 글쓰기 비공개 비밀번호가 규칙(6~64자)에 맞는지 확인한다. 앞뒤 공백도 비밀번호의 일부로 센다.
 * @param {string} password 입력한 비밀번호
 * @returns {string} 규칙에 맞으면 빈 문자열, 아니면 안내 문구
 */
export const validateBoardPassword = (password) => {
  const { min, max } = POST_PASSWORD_LENGTH
  if (password.length === 0) return '비밀번호를 입력해주세요.'
  if (password.length < min) return `비밀번호는 ${min}자 이상이어야 해요.`
  if (password.length > max) return `비밀번호는 ${max}자 이하여야 해요.`
  return ''
}
