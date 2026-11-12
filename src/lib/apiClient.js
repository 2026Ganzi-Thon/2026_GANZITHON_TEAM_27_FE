import axios from 'axios'
import { getDemoId } from '@/lib/demoId'

/**
 * 모든 API 요청에 쓰는 공통 Axios 인스턴스.
 *
 * - baseURL은 환경 변수 `VITE_API_BASE_URL`을 그대로 쓴다.
 *   이 값은 버전 경로까지 포함한다. (예: `http://localhost:8080/api/v1`)
 * - `features/{domain}/api`에서는 `/cases`처럼 버전 뒤 경로만 적는다.
 * - 사용자 식별 헤더는 이 파일의 request interceptor 한 곳에서만 붙인다.
 *   지금은 전시용 `X-Demo-Id`를 쓰고, 회원 버전에서는 `Authorization` 헤더로 교체한다.
 * - `/health`, `/health/live`는 `/api/v1` 밖에 있으므로 이 인스턴스로 호출하지 않는다.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  config.headers.set('X-Demo-Id', getDemoId())
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = error.response?.data?.error?.request_id
    if (requestId) {
      // 백엔드 문의용 요청 ID를 남긴다.
      console.error(`[API] request_id: ${requestId}`)
    }
    return Promise.reject(error)
  },
)
