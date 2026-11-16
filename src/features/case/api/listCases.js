import { readMockCaseDecision, readMockCaseProgress } from '@/lib/mockCaseDecisions'
import { readCases, wait } from './mockCaseStore'

/**
 * 사건 목록 조회. `GET /cases`와 같은 모양(`{ items, next_cursor }`)으로 응답한다. 최근 사건이 먼저 온다.
 *
 * 기소·변론·판결 목업이 남긴 진행 기록(`lib/mockCaseDecisions`)이 있으면 사건명(`title`), 상태(`status`), 종결 감정(`emotion_after`)에 덮어쓴다.
 * 서버에서는 이 값이 사건 응답에 이미 들어 있다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.get('/cases')`로 바꾼다.
 * TODO(API 확인 필요): 목록 item 필드 구조가 확정되면 `utils.js`의 `toCaseView`를 맞춘다.
 *
 * @returns {Promise<{ items: object[], next_cursor: string | null }>}
 */
export const listCases = async () => {
  await wait()
  const items = readCases()
    .map((item) => {
      const progress = readMockCaseProgress(item.id)
      const decision = readMockCaseDecision(item.id)
      return {
        ...item,
        title: progress?.title ?? item.title,
        // 판결 확정 기록이 있으면 종결이고, 아니면 단계별 진행 상태를 따른다.
        status: decision?.status ?? progress?.status ?? item.status,
        emotion_after: decision?.emotion_after ?? item.emotion_after,
      }
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { items, next_cursor: null }
}
