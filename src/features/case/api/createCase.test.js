import { beforeEach, describe, expect, it } from 'vitest'
import { createCase } from './createCase'
import { deleteCase } from './deleteCase'
import { listCases } from './listCases'

const emotion = { type: 'anxiety', intensity: 40 }

describe('mock 사건 접수', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('접수하면 사건파일이 만들어지고 목록에 나타난다', async () => {
    const result = await createCase({ thought: '발표를 망쳤다', emotion, idempotencyKey: 'key-1' })
    expect(result.outcome).toBe('created')
    expect(result.case.status).toBe('received')

    const { items } = await listCases()
    expect(items).toHaveLength(1)
    expect(items[0].thought).toBe('발표를 망쳤다')
  })

  it('같은 Idempotency-Key로 다시 보내면 사건을 새로 만들지 않는다', async () => {
    await createCase({ thought: '발표를 망쳤다', emotion, idempotencyKey: 'key-1' })
    await createCase({ thought: '발표를 망쳤다', emotion, idempotencyKey: 'key-1' })
    expect((await listCases()).items).toHaveLength(1)
  })

  it('위기 상황이면 사건을 만들지 않고 상담 안내를 돌려준다', async () => {
    const result = await createCase({ thought: '죽고 싶다', emotion, idempotencyKey: 'key-2' })
    expect(result.outcome).toBe('support_required')
    expect(result.support.contacts.length).toBeGreaterThan(0)
    expect((await listCases()).items).toHaveLength(0)
  })

  it('최근에 접수한 사건이 목록 앞에 온다', async () => {
    await createCase({ thought: '첫 번째', emotion, idempotencyKey: 'key-a' })
    await new Promise((resolve) => setTimeout(resolve, 5))
    await createCase({ thought: '두 번째', emotion, idempotencyKey: 'key-b' })
    const { items } = await listCases()
    expect(items.map((item) => item.thought)).toEqual(['두 번째', '첫 번째'])
  })

  it('삭제하면 목록에서 사라진다', async () => {
    const { case: created } = await createCase({
      thought: '발표를 망쳤다',
      emotion,
      idempotencyKey: 'key-1',
    })
    await deleteCase(created.id)
    expect((await listCases()).items).toHaveLength(0)
  })
})
