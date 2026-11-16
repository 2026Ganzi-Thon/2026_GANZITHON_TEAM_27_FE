import { apiClient } from '@/lib/apiClient'
import {
  answerMockQuestion,
  getMockThread,
  mockCase,
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
 * 사건 정보를 조회한다(`GET /cases/{id}`). 변론 화면에서는 사건번호(`case_number`) 표시에만 쓴다.
 * TODO(공통화 검토): 기소·변론이 같은 사건을 따로 조회한다(D19). `@/features/case`의 `useCase`로 합칠지 검토한다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<{id: string, case_number?: string, status: string}>} 사건 정보
 */
export const fetchCase = async (caseId) => {
  if (USE_DEFENSE_MOCK) return resolveMock({ ...mockCase, id: caseId })
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}

/** 사건당 질문 최대 개수 (`POST /cases/{id}/defense/questions`가 3개 뒤에는 `409 DEFENSE_COMPLETED`) */
const MAX_QUESTIONS = 3

/** 서버 `answer_status`를 화면 답변 action으로 바꾸는 표 */
const ANSWER_ACTIONS = { answered: 'answer', not_sure: 'not_sure', skipped: 'skip' }

/**
 * 사건 상세의 변론 항목(`defense[]`, `open_question`) 하나를 화면 질문 모양으로 바꾼다.
 * `prompts`는 [처음 문장, 쉽게 바꾼 문장…] 순서라서 첫 문장을 질문으로, 나머지를 쉽게 바꾼 문장으로 쓴다.
 * @param {object} item 서버 질문 항목
 * @returns {DefenseQuestion}
 */
export const toDefenseQuestion = (item) => {
  const prompts = Array.isArray(item.prompts) ? item.prompts : []
  return {
    id: item.id,
    sequence: item.sequence,
    prompt: prompts[0] ?? item.prompt,
    revision: item.revision ?? 0,
    simplifiedPrompts: prompts.slice(1),
  }
}

/**
 * 서버 질문 항목을 대화 항목(질문 + 내가 보낸 답)으로 바꾼다. 미응답(`pending`)이면 답이 null이다.
 * @param {object} item 서버 질문 항목
 * @returns {DefenseThreadItem}
 */
export const toDefenseThreadItem = (item) => {
  const action = ANSWER_ACTIONS[item.answer_status]
  return {
    question: toDefenseQuestion(item),
    answer: action
      ? action === 'answer'
        ? { action, text: item.answer ?? '' }
        : { action }
      : null,
  }
}

/**
 * 변론 대화를 불러온다.
 * 1. `GET /cases/{id}`의 `defense[]`(와 `open_question`)로 지금까지의 질문과 답을 만든다.
 * 2. 답할 질문이 없고, 질문이 3개 미만이며, 사건이 아직 `defense` 단계면
 *    `POST /cases/{id}/defense/questions`로 다음 질문을 받아 붙인다. `409 DEFENSE_COMPLETED`면 더 받을 질문이 없다.
 * 답을 보낸 뒤 이 함수를 다시 부르면 다음 질문이 자동으로 나타나고,
 * 답할 질문이 없으면 화면의 "변론 종료"가 활성화된다(utils.canFinishDefense).
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<DefenseThreadItem[]>} 질문과 답 목록
 */
export const fetchDefenseThread = async (caseId) => {
  if (USE_DEFENSE_MOCK) return resolveMock(getMockThread())
  const { data: detail } = await apiClient.get(`/cases/${caseId}`)
  const items = [...(Array.isArray(detail?.defense) ? detail.defense : [])]
  const openQuestion = detail?.open_question
  if (openQuestion && !items.some((item) => item.id === openQuestion.id)) items.push(openQuestion)
  items.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))

  const thread = items.map(toDefenseThreadItem)
  const hasOpenQuestion = thread.some((item) => !item.answer)
  // 이미 다음 단계(판결 등)로 넘어간 사건이면 질문을 더 받지 않는다.
  const isPastDefense = Boolean(detail?.status) && detail.status !== 'defense'
  if (hasOpenQuestion || thread.length >= MAX_QUESTIONS || isPastDefense) {
    return thread
  }

  try {
    const { data: question } = await apiClient.post(`/cases/${caseId}/defense/questions`)
    return [...thread, toDefenseThreadItem(question)]
  } catch (error) {
    if (error?.response?.data?.error?.code === 'DEFENSE_COMPLETED') return thread
    throw error
  }
}

/**
 * 질문에 답한다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {string} questionId 질문 ID
 * @param {{action: 'answer' | 'skip' | 'not_sure', text?: string, revision: number}} body
 *   `text`는 action이 answer일 때만 보낸다. `revision`은 최신 값이어야 하며, 오래된 값이면 409가 온다.
 * @returns {Promise<object>} 서버 응답. 자유 입력에 위기 신호가 있으면 HTTP 200 `{ outcome: "support_required", support }`
 */
export const submitDefenseAnswer = async (caseId, questionId, body) => {
  if (USE_DEFENSE_MOCK) return resolveMock(answerMockQuestion(questionId, body))
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
