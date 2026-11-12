import { readCases, wait, writeCases } from './mockCaseStore'

/**
 * 사건 삭제. `DELETE /cases/{id}`와 같은 역할을 한다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.delete(`/cases/${id}`)`로 바꾼다.
 *
 * @param {string} id 삭제할 사건 ID
 * @returns {Promise<void>}
 */
export const deleteCase = async (id) => {
  await wait()
  writeCases(readCases().filter((item) => item.id !== id))
}
