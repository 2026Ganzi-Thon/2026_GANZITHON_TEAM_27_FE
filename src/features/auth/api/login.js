import { mockLogin } from './mockLogin'

/**
 * 로그인 요청.
 * TODO(API 확인 필요): 서버가 준비되면 mockLogin 대신 apiClient.post('/auth/login', values)를 쓴다.
 * @param {{username: string, password: string}} values 아이디와 비밀번호
 * @returns {Promise<{username: string}>} 로그인한 사용자 정보
 */
export const login = (values) => mockLogin(values)
