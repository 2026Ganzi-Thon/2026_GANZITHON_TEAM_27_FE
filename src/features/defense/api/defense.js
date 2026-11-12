import { apiClient } from '@/lib/apiClient'
import {
  getMockThread,
  mockCase,
  recordMockAnswer,
  resolveMock,
  simplifyMockQuestion,
  USE_DEFENSE_MOCK,
} from '../mocks/defenseMocks'

/**
 * @typedef {object} DefenseQuestion
 * @property {string} id 질문 ID
 * @property {number} sequence 질문 순번 (사건당 최대 3개)
 * @property {string} prompt 질문 문장 (처음 받은 문장)
 * @property {number} revision 질문 문장 버전. 답할 때 최신 값을 보내야 한다.
 * @property {string[]} [simplifiedPrompts] "질문을 쉽게 바꿔주세요."로 받은 문장들 (화면에서만 쌓는다)
 */

/**
 * @typedef {object} DefenseThreadItem
 * @property {DefenseQuestion | null} question AI 질문
 * @property {{action: 'answer' | 'skip' | 'not_sure', text?: string} | null} answer 내가 보낸 답
 */

/**
 * 사건 정보를 조회한다. 변론 화면에서는 사건번호 표시에만 쓴다.
 * TODO(API 확인 필요): 응답 구조가 미확정이다. 사건번호 필드가 `case_number`인지 확인한다.
 * TODO(공통화 검토): 기소 화면에도 같은 함수가 있다. 사건(case) 도메인이 생기면 그쪽으로 옮긴다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<{id: string, case_number?: string, status: string}>} 사건 정보
 */
export const fetchCase = async (caseId) => {
  if (USE_DEFENSE_MOCK) return resolveMock({ ...mockCase, id: caseId })
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}

/**
 * 변론 대화를 불러온다.
 * 지금 명세에는 대화 기록 API가 없어서, 실제 API에서는 현재 답할 질문 하나만 받는다
 * (`POST /cases/{id}/defense/questions`: 새 질문이면 201, 답하지 않은 질문이 있으면 그 질문을 200으로 돌려준다).
 * TODO(API 확인 필요): 이미 답한 질문과 답을 다시 받을 방법(GET /cases/{id} 응답 등)을 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<DefenseThreadItem[]>} 질문과 답 목록
 */
export const fetchDefenseThread = async (caseId) => {
  if (USE_DEFENSE_MOCK) return resolveMock(getMockThread())
  const { data } = await apiClient.post(`/cases/${caseId}/defense/questions`)
  return [{ question: data, answer: null }]
}

/**
 * 질문에 답한다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {string} questionId 질문 ID
 * @param {{action: 'answer' | 'skip' | 'not_sure', text?: string, revision: number}} body
 *   `text`는 action이 answer일 때만 보낸다. `revision`은 최신 값이어야 하며, 오래된 값이면 409가 온다.
 * @returns {Promise<object>} 서버 응답
 */
export const submitDefenseAnswer = async (caseId, questionId, body) => {
  if (USE_DEFENSE_MOCK) {
    recordMockAnswer(questionId, { action: body.action, text: body.text })
    return resolveMock({ ok: true })
  }
  const { data } = await apiClient.put(
    `/cases/${caseId}/defense/questions/${questionId}/answer`,
    body,
  )
  return data
}

/**
 * 질문을 더 쉬운 문장으로 바꿔 달라고 요청한다. 순번은 그대로이고 revision만 오른다(질문당 최대 2회).
 * TODO(API 확인 필요): 응답 필드 이름(`prompt`, `revision`)을 확인한다.
 * TODO(API 확인 필요): 오래된 revision이면 409가 온다. GET /cases/{id}로 다시 조회하는 흐름은 API 연결 때 붙인다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {string} questionId 질문 ID
 * @param {{revision: number}} body 현재 revision
 * @returns {Promise<{prompt: string, revision: number}>} 새 문장과 새 revision
 */
export const simplifyDefenseQuestion = async (caseId, questionId, body) => {
  if (USE_DEFENSE_MOCK) return resolveMock(simplifyMockQuestion(questionId))
  const { data } = await apiClient.post(
    `/cases/${caseId}/defense/questions/${questionId}/simplify`,
    body,
  )
  return data
}
