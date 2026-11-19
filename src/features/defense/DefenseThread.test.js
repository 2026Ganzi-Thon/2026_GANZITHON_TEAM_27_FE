import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { fetchDefenseThread, submitDefenseAnswer } from './api/defense'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

/** 사건 상세의 변론 항목 하나를 만든다. */
const item = (sequence, overrides = {}) => ({
  id: `q${sequence}`,
  sequence,
  prompt: `질문 ${sequence}`,
  revision: 0,
  prompts: [`질문 ${sequence}`],
  suggested_answers: [],
  answer_status: 'answered',
  answer: `답 ${sequence}`,
  ...overrides,
})

/** 오류 코드가 담긴 Axios 오류를 만든다. */
const conflict = (code) =>
  Object.assign(new Error('conflict'), {
    response: { status: 409, data: { error: { code, message: '...' } } },
  })

describe('fetchDefenseThread (실제 API)', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
  })

  it('사건 상세의 defense[]로 질문과 답을 만들고, 쉽게 바꾼 문장은 prompts 뒤쪽에서 읽는다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        status: 'defense',
        defense: [
          item(1, {
            prompt: '쉬운 문장',
            revision: 1,
            prompts: ['처음 문장', '쉬운 문장'],
          }),
          item(2, { answer_status: 'not_sure', answer: null }),
          item(3, { answer_status: 'pending', answer: null }),
        ],
      },
    })

    const thread = await fetchDefenseThread('case-1')

    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')
    expect(apiClient.post).not.toHaveBeenCalled()
    expect(thread).toEqual([
      {
        question: {
          id: 'q1',
          sequence: 1,
          prompt: '처음 문장',
          revision: 1,
          simplifiedPrompts: ['쉬운 문장'],
        },
        answer: { action: 'answer', text: '답 1' },
      },
      {
        question: { id: 'q2', sequence: 2, prompt: '질문 2', revision: 0, simplifiedPrompts: [] },
        answer: { action: 'not_sure' },
      },
      {
        question: { id: 'q3', sequence: 3, prompt: '질문 3', revision: 0, simplifiedPrompts: [] },
        answer: null,
      },
    ])
  })

  it('답할 질문이 없고 3개 미만이면 다음 질문을 받아 붙인다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'defense', defense: [item(1, { answer_status: 'skipped', answer: null })] },
    })
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { ...item(2, { answer_status: 'pending', answer: null }), remaining: 1 },
    })

    const thread = await fetchDefenseThread('case-1')

    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/defense/questions')
    expect(thread.map((entry) => entry.answer)).toEqual([{ action: 'skip' }, null])
    expect(thread[1].question.id).toBe('q2')
  })

  it('질문을 3개 처리했으면 더 요청하지 않는다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'defense', defense: [item(1), item(2), item(3)] },
    })
    const thread = await fetchDefenseThread('case-1')
    expect(thread).toHaveLength(3)
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('이미 판결 단계로 넘어간 사건이면 질문을 요청하지 않는다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'decision_review', defense: [item(1)] },
    })
    await fetchDefenseThread('case-1')
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('409 DEFENSE_COMPLETED면 더 받을 질문이 없는 것으로 본다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { status: 'defense', defense: [item(1)] },
    })
    vi.mocked(apiClient.post).mockRejectedValue(conflict('DEFENSE_COMPLETED'))
    const thread = await fetchDefenseThread('case-1')
    expect(thread).toHaveLength(1)
  })

  it('다른 오류는 그대로 던진다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { status: 'defense', defense: [] } })
    vi.mocked(apiClient.post).mockRejectedValue(conflict('INVALID_CASE_STATE'))
    await expect(fetchDefenseThread('case-1')).rejects.toThrow('conflict')
  })

  it('v1.4 중첩 응답({ case, questions, defense_completed })을 읽고 완료 상태면 질문을 더 요청하지 않는다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        case: { id: 'case-1', status: 'defense' },
        questions: [item(1), item(2)],
        defense_completed: true,
      },
    })
    const thread = await fetchDefenseThread('case-1')
    expect(thread).toHaveLength(2)
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('submitDefenseAnswer는 skip/not_sure일 때 text 필드를 생략한다', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: item(1, { answer_status: 'skipped' }) })
    await submitDefenseAnswer('case-1', 'q1', { action: 'skip', text: '무시', revision: 0 })
    expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/defense/questions/q1/answer', {
      action: 'skip',
      revision: 0,
    })
  })
})
