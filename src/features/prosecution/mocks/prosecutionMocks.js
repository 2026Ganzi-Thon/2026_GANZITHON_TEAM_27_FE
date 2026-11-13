import { saveMockCaseDecision } from '@/lib/mockCaseDecisions'

/**
 * 기소 화면 목업 데이터. Figma `2-1 기소` 화면의 내용을 그대로 담는다.
 * 모양은 docs/api-spec.md의 응답 구조를 따르므로, API가 준비되면 이 파일만 지우고 api/에서 분기를 없애면 된다.
 *
 * 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 */
export const USE_PROSECUTION_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/** 브라우저에서 바로 확인할 때 쓰는 데모 사건 ID. 목업은 사건 ID와 관계없이 같은 데이터를 돌려준다. */
export const DEMO_CASE_ID = 'demo'

/**
 * `GET /cases/{id}` 목업 중 기소 화면에 필요한 부분.
 * TODO(API 확인 필요): 실제 응답 구조가 정해지면 필드 이름을 맞춘다. 명세의 사건번호 예시는 `2026-000031`이다.
 */
export const mockCase = {
  id: DEMO_CASE_ID,
  case_number: '2026-031',
  status: 'evidence_review',
}

/** `POST /cases/{id}/prosecution` 200 응답 목업 */
export const mockProsecutionDraft = {
  title: '회의 발표 사건',
  claim: '피고인은 “ 나는 쓸모없어" 라는 생각으로  \n본 법정에 기소되었습니다.',
  pattern_candidates: ['all_or_nothing', 'labeling'],
  evidence: [
    { type: 'observed', text: '실수 후 자책한 기록' },
    { type: 'interpretation', text: '타인의 무관심을 느낀 경험' },
  ],
}

/** `PUT /cases/{id}/evidence` 200 응답 목업 */
export const mockEvidenceResult = { status: 'defense' }

/**
 * 증거 확정 목업: 확정한 사고 패턴(`pattern_tags`)을 사건별 목업 저장소에 남긴다(사건요약의 "사건 유형"이 읽는다).
 * @param {string} caseId 사건 ID
 * @param {{pattern_tags?: string[]}} body 확정 요청 본문
 * @returns {object} 응답 목업
 */
export const recordMockEvidence = (caseId, body) => {
  saveMockCaseDecision(caseId, { pattern_tags: body.pattern_tags ?? [] })
  return mockEvidenceResult
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
