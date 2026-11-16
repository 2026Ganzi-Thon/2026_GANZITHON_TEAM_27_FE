import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { createCase } from './createCase'
import { deleteCase } from './deleteCase'
import { getCase } from './getCase'
import { listCases } from './listCases'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const emotion = { type: 'anxiety', intensity: 40 }

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

describe('사건 API', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.delete).mockReset()
  })

  it('접수하면 Idempotency-Key 헤더와 함께 POST /cases를 보내고 응답을 그대로 돌려준다', async () => {
    const created = { id: 'case-1', status: 'received', thought: '발표를 망쳤다' }
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { outcome: 'case_created', case: created },
    })

    const result = await createCase({ thought: '발표를 망쳤다', emotion, idempotencyKey: 'key-1' })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/cases',
      { thought: '발표를 망쳤다', emotion },
      { headers: { 'Idempotency-Key': 'key-1' } },
    )
    expect(result.outcome).toBe('case_created')
    expect(result.case.status).toBe('received')
  })

  it('위기 상황 응답(support_required)도 그대로 돌려준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { outcome: 'support_required', support: { message: '...', contacts: ['109'] } },
    })
    const result = await createCase({ thought: '죽고 싶다', emotion, idempotencyKey: 'key-2' })
    expect(result.outcome).toBe('support_required')
    expect(result.support.contacts.length).toBeGreaterThan(0)
  })

  it('목록은 GET /cases의 items와 next_cursor를 돌려준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { items: [{ id: 'b' }, { id: 'a' }], next_cursor: null },
    })
    expect(await listCases()).toEqual({ items: [{ id: 'b' }, { id: 'a' }], next_cursor: null })
    expect(apiClient.get).toHaveBeenCalledWith('/cases')
  })

  it('사건 하나는 GET /cases/{id}로 읽고, 없으면(404) null이다', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { id: 'case-1' } })
    expect(await getCase('case-1')).toEqual({ id: 'case-1' })
    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')

    vi.mocked(apiClient.get).mockRejectedValueOnce(httpError(404))
    expect(await getCase('missing')).toBeNull()
  })

  it('404가 아닌 오류는 그대로 던진다', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(httpError(503))
    await expect(getCase('case-1')).rejects.toThrow('request failed')
  })

  it('예시 사건(sample)은 서버를 거치지 않는다', async () => {
    const sample = await getCase('sample')
    expect(sample.id).toBe('sample')
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('삭제하면 DELETE /cases/{id}를 보낸다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })
    await deleteCase('case-1')
    expect(apiClient.delete).toHaveBeenCalledWith('/cases/case-1')
  })
})
