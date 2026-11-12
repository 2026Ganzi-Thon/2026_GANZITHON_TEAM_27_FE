import { readCases, wait, writeCases } from './mockCaseStore'

/** 임시로 위기 상황을 알아보는 말. 서버가 `support_required`를 돌려주는 흐름을 흉내 낸다. */
const CRISIS_WORDS = ['자살', '자해', '죽고 싶', '죽고싶']

/**
 * 사건 접수. `POST /cases`와 같은 모양으로 응답한다.
 *
 * - 위기 상황으로 보이면 사건을 만들지 않고 `support_required`를 돌려준다.
 * - 같은 `idempotencyKey`로 다시 보내면 새로 만들지 않고 기존 사건을 돌려준다.
 *
 * TODO(API 확인 필요): 서버가 준비되면 `apiClient.post('/cases', { thought, emotion }, { headers: { 'Idempotency-Key': idempotencyKey } })`로 바꾼다.
 * TODO(API 확인 필요): `emotion` 요청 형태(`{ type, intensity }`로 추정)와 응답 필드가 확정되면 맞춘다.
 *
 * @param {{ thought: string, emotion?: { type: string, intensity: number }, idempotencyKey: string }} values
 * @returns {Promise<{ outcome: 'created', case: object } | { outcome: 'support_required', support: { message: string, contacts: string[] } }>}
 */
export const createCase = async ({ thought, emotion, idempotencyKey }) => {
  await wait()

  if (CRISIS_WORDS.some((word) => thought.includes(word))) {
    return {
      outcome: 'support_required',
      support: {
        message: '지금은 재판보다 도움을 받는 것이 먼저예요. 아래 전화로 이야기해 보세요.',
        contacts: ['자살예방상담전화 109', '정신건강위기상담 1577-0199'],
      },
    }
  }

  const cases = readCases()
  const existing = cases.find((item) => item.idempotency_key === idempotencyKey)
  if (existing) return { outcome: 'created', case: existing }

  const now = new Date()
  const created = {
    id: crypto.randomUUID(),
    idempotency_key: idempotencyKey,
    case_number: `${now.getFullYear()}-${String(cases.length + 1).padStart(6, '0')}`,
    // 사건명은 기소 단계에서 정해지므로 접수 직후에는 없다.
    title: null,
    thought,
    emotion: emotion ?? null,
    emotion_after: null,
    status: 'received',
    created_at: now.toISOString(),
  }
  writeCases([created, ...cases])
  return { outcome: 'created', case: created }
}
