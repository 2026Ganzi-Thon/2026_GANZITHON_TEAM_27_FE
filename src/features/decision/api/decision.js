import { apiClient } from '@/lib/apiClient'
import {
  createMockRephrase,
  mockDecisionDraft,
  mockFinalResult,
  resolveMock,
  USE_DECISION_MOCK,
} from '../mocks/decisionMocks'

/**
 * @typedef {'reframed' | 'deferred' | 'action_needed'} DecisionType
 */

/**
 * @typedef {object} DecisionDraft
 * @property {DecisionType} type 판결 유형
 * @property {string[]} reported_facts 사실인 부분
 * @property {string[]} unsupported_claims 근거가 부족한(과장된) 부분
 * @property {string} suggested_statement 제안된 최종 진술문 (수정된 생각)
 * @property {string | null} next_action 다음 행동 제안
 * @property {number} [version] 재표현·확정 충돌 확인용 버전
 */

/**
 * 판결 초안을 만들거나, 이미 만든 초안을 다시 받는다.
 * AI 생성 API지만 재시도하면 서버가 저장된 초안을 돌려주므로 여러 번 불러도 안전하다.
 * TODO(API 확인 필요): 응답이 `{ status, decision }` 모양인지, version을 어디서 주는지 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<{status: string, decision: DecisionDraft}>} 판결 초안
 */
export const requestDecision = async (caseId) => {
  if (USE_DECISION_MOCK) return resolveMock(mockDecisionDraft)
  const { data } = await apiClient.post(`/cases/${caseId}/decision`)
  return data
}

/**
 * 제안 문장을 다른 표현으로 바꿔 달라고 요청한다. version이 오래되면 409가 온다.
 * TODO(API 확인 필요): 응답 필드 이름을 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {{style: 'neutral' | 'shorter' | 'gentler', version: number}} body 재표현 스타일과 현재 version
 * @returns {Promise<{suggested_statement: string, version: number}>} 새 제안 문장과 새 version
 */
export const rephraseDecision = async (caseId, body) => {
  if (USE_DECISION_MOCK) return resolveMock(createMockRephrase(body.version))
  const { data } = await apiClient.post(`/cases/${caseId}/decision/rephrase`, body)
  return data
}

/**
 * 판결을 확정하고 사건을 종결한다.
 * `final_statement`는 판결 유형이 `deferred`일 때만 생략할 수 있다.
 * TODO(API 확인 필요): emotion_after 형태가 미확정이다. Figma `2-6 감정변화` 화면이 연결되면 함께 보낸다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {{decision_type: DecisionType, final_statement?: string, emotion_after?: object}} body 확정할 내용
 * @returns {Promise<object>} 종결된 사건
 */
export const finalizeDecision = async (caseId, body) => {
  if (USE_DECISION_MOCK) return resolveMock(mockFinalResult)
  const { data } = await apiClient.put(`/cases/${caseId}/decision/final`, body)
  return data
}
