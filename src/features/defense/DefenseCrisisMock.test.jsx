import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import { CRISIS_WORDS, includesCrisisWord } from '@/constants/crisisWords'
import { useCreateCase } from '@/features/case'
import { answerMockQuestion, getMockThread, resetMockThread } from './mocks/defenseMocks'

describe('변론 답변 목업: 서버처럼 위기 신호 판단', () => {
  beforeEach(() => {
    resetMockThread()
  })

  it.each(CRISIS_WORDS)(
    '"%s"가 들어간 답변은 support_required를 돌려주고 대화에 남기지 않는다',
    (word) => {
      const before = JSON.stringify(getMockThread())
      const response = answerMockQuestion('q2', {
        action: 'answer',
        text: `요즘 ${word} 생각이 들어`,
      })

      expect(response.outcome).toBe('support_required')
      expect(response.support.contacts.length).toBeGreaterThan(0)
      expect(JSON.stringify(getMockThread())).toBe(before)
      expect(JSON.stringify(getMockThread())).not.toContain(word)
    },
  )

  it('보통 답변은 대화에 기록하고 다음 질문으로 넘어간다', () => {
    const response = answerMockQuestion('q2', { action: 'answer', text: '기분이 좋았다' })
    expect(response).toEqual({ ok: true })
    expect(getMockThread().find((item) => item.question?.id === 'q2').answer.text).toBe(
      '기분이 좋았다',
    )
  })

  it.each(['skip', 'not_sure'])('글이 없는 %s는 위기 판단 대상이 아니다', (action) => {
    expect(answerMockQuestion('q2', { action })).toEqual({ ok: true })
  })
})

describe('위기 단어 기준이 사건 접수 목업과 같다', () => {
  const renderCreateCase = () =>
    renderHook(() => useCreateCase(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
      ),
    })

  beforeEach(() => {
    localStorage.clear()
  })

  it.each([
    ...CRISIS_WORDS.map((word) => [`요즘 ${word} 생각이 들어`, true]),
    ['회의에서 발표를 망쳤다', false],
    ['자존감이 낮아졌다', false],
  ])('"%s" → 위기 %s (접수 목업과 판단이 같다)', async (text, expected) => {
    const { result } = renderCreateCase()
    let response
    await act(async () => {
      response = await result.current.mutateAsync({ thought: text, idempotencyKey: text })
    })

    expect(includesCrisisWord(text)).toBe(expected)
    expect(response.outcome === 'support_required').toBe(expected)
  })
})
