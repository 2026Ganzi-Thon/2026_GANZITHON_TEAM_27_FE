import { apiClient } from '@/lib/apiClient'

/**
 * 사건 목록 조회. `GET /cases` → `{ items, next_cursor }` (최근 사건이 먼저 온다)
 *
 * TODO(API 확인 필요): 목록은 cursor로 이어 받을 수 있다. 화면에 더 보기가 생기면 `useInfiniteQuery`로 붙인다.
 *
 * @returns {Promise<{ items: object[], next_cursor: string | null }>}
 */
export const listCases = async () => {
  const { data } = await apiClient.get('/cases')
  return { items: data?.items ?? [], next_cursor: data?.next_cursor ?? null }
}
