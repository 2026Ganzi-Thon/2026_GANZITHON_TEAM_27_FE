import { apiClient } from '@/lib/apiClient'

/**
 * 화면 확인용 예시 사건. 주소의 사건 ID가 `sample`이면 서버를 거치지 않고 이 사건을 돌려준다.
 * `/cases/sample/card`, `/cases/sample/share`로 사건 카드와 게시판 공유 화면을 언제든 볼 수 있도록 유지한다.
 */
export const SAMPLE_CASE = {
  id: 'sample',
  case_number: '2026-000031',
  title: '회의 발표 사건',
  thought: '나는 쓸모없어.',
  final_statement: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
  emotion: { type: 'anxiety', intensity: 70 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  status: 'closed',
  created_at: '2026-11-06T03:00:00.000Z',
}

/**
 * v1.4 사건 상세 응답(`{ case, evidence, questions, decision, can_request_decision, defense_completed }`)을
 * 화면에서 공통으로 쓰는 평탄화된 사건 모양으로 정규화한다.
 * 테스트·목업처럼 이미 평탄화된 객체(`data.case`가 없는 경우)는 그대로 돌려준다.
 *
 * @param {object | null | undefined} data `GET /cases/{id}` 응답 본문
 * @returns {object | null | undefined}
 */
export const normalizeCaseDetail = (data) => {
  if (!data || typeof data !== 'object' || !data.case) return data
  const c = data.case
  const decision = data.decision
    ? {
        ...data.decision,
        draft_type: data.decision.type,
        type: data.decision.final_type ?? data.decision.type,
        version: c.version,
      }
    : null
  const followUp = data.decision?.follow_up_choice
    ? {
        choice: data.decision.follow_up_choice,
        action_text: data.decision.follow_up_action ?? null,
        updated_at: data.decision.follow_up_updated_at ?? null,
      }
    : null
  const questions = Array.isArray(data.questions) ? data.questions : []
  return {
    id: c.id,
    case_number: c.case_number,
    status: c.status,
    version: c.version,
    title: c.title,
    claim: c.claim,
    summary: c.summary,
    thought: c.original_thought ?? c.thought,
    pattern_candidates: c.pattern_candidates,
    pattern_tags: c.pattern_tags,
    primary_pattern: c.primary_pattern,
    emotion: c.emotion,
    emotion_after: c.emotion_after,
    created_at: c.created_at,
    updated_at: c.updated_at,
    closed_at: c.closed_at,
    evidence: data.evidence ?? [],
    questions,
    defense: questions,
    decision,
    final_statement: data.decision?.final_statement ?? null,
    follow_up: followUp,
    can_request_decision: data.can_request_decision,
    defense_completed: data.defense_completed,
  }
}

/**
 * 사건 하나 조회. `GET /cases/{id}` (사건 상세). 없는 사건(`404`)이면 `null`을 돌려준다.
 *
 * @param {string} id 사건 ID
 * @returns {Promise<object | null>}
 */
export const getCase = async (id) => {
  if (id === SAMPLE_CASE.id) return SAMPLE_CASE
  try {
    const { data } = await apiClient.get(`/cases/${id}`)
    return normalizeCaseDetail(data)
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}
