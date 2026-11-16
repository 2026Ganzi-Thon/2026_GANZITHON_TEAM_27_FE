import { apiClient } from '@/lib/apiClient'

/**
 * 사건 접수. `POST /cases`
 *
 * - 위기 상황이면 서버가 사건을 만들지 않고 HTTP 200 `{ outcome: "support_required", support }`를 돌려준다.
 * - 같은 `idempotencyKey`로 같은 본문을 다시 보내면 서버가 처음과 같은 응답을 돌려준다(새 사건을 만들지 않는다).
 *
 * @param {{ thought: string, emotion?: { type: string, intensity: number }, idempotencyKey: string }} values
 * @returns {Promise<{ outcome: 'case_created', case: object } | { outcome: 'support_required', support: { message: string, contacts: string[] } }>}
 */
export const createCase = async ({ thought, emotion, idempotencyKey }) => {
  const { data } = await apiClient.post(
    '/cases',
    { thought, emotion },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  )
  return data
}
