import { apiClient } from '@/lib/apiClient'
import {
  mockCase,
  mockEvidenceResult,
  mockProsecutionDraft,
  resolveMock,
  USE_PROSECUTION_MOCK,
} from '../mocks/prosecutionMocks'

/**
 * @typedef {object} ProsecutionDraft
 * @property {string} title 사건 제목
 * @property {string} claim 기소 주장
 * @property {string[]} pattern_candidates 사고 패턴 후보 (enum 값)
 * @property {Array<{type: string, text: string}>} evidence 검사 측 증거
 */

/**
 * 사건 정보를 조회한다. 기소 화면에서는 사건번호 표시에만 쓴다.
 * TODO(API 확인 필요): 응답 구조가 미확정이다. 사건번호 필드가 `case_number`인지 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<{id: string, case_number?: string, status: string}>} 사건 정보
 */
export const fetchCase = async (caseId) => {
  if (USE_PROSECUTION_MOCK) return resolveMock({ ...mockCase, id: caseId })
  const { data } = await apiClient.get(`/cases/${caseId}`)
  return data
}

/**
 * 기소 초안을 만들거나, 이미 만든 초안을 다시 받는다.
 * AI 생성 API지만 재시도하면 서버가 저장된 초안을 돌려주므로 여러 번 불러도 안전하다.
 * TODO(API 확인 필요): 응답이 위 필드만 바로 주는지, 다른 객체로 한 번 감싸서 주는지 확인한다.
 * TODO(API 확인 필요): pattern_candidates가 enum 문자열 배열인지 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @returns {Promise<ProsecutionDraft>} 기소 초안
 */
export const requestProsecution = async (caseId) => {
  if (USE_PROSECUTION_MOCK) return resolveMock(mockProsecutionDraft)
  const { data } = await apiClient.post(`/cases/${caseId}/prosecution`)
  return data
}

/**
 * 확인한 기소 주장·사고 패턴·증거를 확정한다. 성공하면 사건 status가 `defense`로 바뀐다.
 * TODO(API 확인 필요): 근거 전체를 교체하는지, 사건명을 함께 수정할 수 있는지 확인한다.
 * @param {string} caseId 사건 ID (UUID)
 * @param {{claim: string, pattern_tags: string[], evidence: Array<{type: string, text: string}>}} body 확정할 내용
 * @returns {Promise<object>} 서버 응답
 */
export const submitEvidence = async (caseId, body) => {
  if (USE_PROSECUTION_MOCK) return resolveMock(mockEvidenceResult)
  const { data } = await apiClient.put(`/cases/${caseId}/evidence`, body)
  return data
}
