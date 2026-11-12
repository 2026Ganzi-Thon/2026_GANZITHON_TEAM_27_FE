import { readCases, wait } from './mockCaseStore'

/**
 * 사건 목록 조회. `GET /cases`와 같은 모양(`{ items, next_cursor }`)으로 응답한다. 최근 사건이 먼저 온다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.get('/cases')`로 바꾼다.
 * TODO(API 확인 필요): 목록 item 필드 구조가 확정되면 `utils.js`의 `toCaseView`를 맞춘다.
 *
 * @returns {Promise<{ items: object[], next_cursor: string | null }>}
 */
export const listCases = async () => {
  await wait()
  const items = [...readCases()].sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { items, next_cursor: null }
}
