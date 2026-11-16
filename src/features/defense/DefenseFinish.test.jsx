import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchDefenseThread, submitDefenseAnswer } from './api/defense'
import { DefenseView } from './index'

// 대화 상태(질문을 몇 개 처리했는지)를 직접 바꿔 가며 보기 위해 API 함수를 바꿔 끼운다.
vi.mock('./api/defense', () => ({
  fetchCase: vi.fn(async () => ({ case_number: '2026-031' })),
  fetchDefenseThread: vi.fn(),
  submitDefenseAnswer: vi.fn(),
  simplifyDefenseQuestion: vi.fn(),
}))

const question = (id) => ({ id, sequence: Number(id.slice(1)), prompt: `${id} 질문`, revision: 0 })
let thread

const renderView = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/cases/case-1/defense']}>
        <Routes>
          <Route
            path="/cases/:caseId/defense"
            element={<DefenseView caseId="case-1" finishTo="/cases/case-1/decision" />}
          />
          <Route path="/cases/:caseId/decision" element={<h1>판결 화면</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )

const finishLink = () => screen.getByRole('link', { name: '변론 종료' })

describe('변론 종료 버튼', () => {
  beforeEach(() => {
    thread = [{ question: question('q1'), answer: null }]
    vi.mocked(fetchDefenseThread)
      .mockReset()
      .mockImplementation(async () => thread)
    vi.mocked(submitDefenseAnswer)
      .mockReset()
      .mockImplementation(async (_, questionId, body) => {
        thread = thread.map((item) =>
          item.question?.id === questionId ? { ...item, answer: { action: body.action } } : item,
        )
        return { ok: true }
      })
  })

  it('처음(처리한 질문 없음, 미응답 질문 있음)에는 비활성이고 이유를 읽어 준다', async () => {
    renderView()
    await screen.findByText('q1 질문')
    expect(finishLink()).toHaveAttribute('aria-disabled', 'true')
    expect(finishLink()).toHaveAccessibleDescription(
      '질문에 하나 이상 답하고, 답하지 않은 질문이 없을 때 누를 수 있어요.',
    )
    expect(finishLink()).toHaveAttribute('href', '/cases/case-1/decision')
  })

  it('비활성일 때 눌러도 이동하지 않는다', async () => {
    renderView()
    await screen.findByText('q1 질문')
    fireEvent.click(finishLink())
    expect(screen.queryByRole('heading', { name: '판결 화면' })).not.toBeInTheDocument()
  })

  it.each([
    [
      '답변',
      () => {
        fireEvent.change(screen.getByLabelText('답변'), { target: { value: '있었다' } })
        fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))
      },
    ],
    [
      '건너뛰기',
      () => {
        fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: false }))
        fireEvent.click(screen.getByRole('button', { name: '이 질문 건너뛰기' }))
      },
    ],
    [
      '떠오르지 않아요',
      () => {
        fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: false }))
        fireEvent.click(screen.getByRole('button', { name: '떠오르지 않아요.' }))
      },
    ],
  ])('질문 1개를 %s(으)로 처리하고 미응답 질문이 없으면 활성이 된다', async (_, handle) => {
    renderView()
    await screen.findByText('q1 질문')
    handle()
    await waitFor(() => expect(finishLink()).toHaveAttribute('aria-disabled', 'false'))
    expect(finishLink()).not.toHaveAccessibleDescription()
  })

  it('미응답 질문이 새로 생기면 다시 비활성이 된다', async () => {
    thread = [{ question: question('q1'), answer: { action: 'skip' } }]
    renderView()
    await waitFor(() => expect(finishLink()).toHaveAttribute('aria-disabled', 'false'))

    // 다음 질문이 도착한다(답하면 서버가 다음 질문을 주는 상황)
    vi.mocked(submitDefenseAnswer).mockImplementationOnce(async () => {
      thread = [...thread, { question: question('q2'), answer: null }]
      return { ok: true }
    })
    fireEvent.change(screen.getByLabelText('답변'), { target: { value: '덧붙임' } })
    fireEvent.click(screen.getByRole('button', { name: '답변 보내기' }))

    await screen.findByText('q2 질문')
    expect(finishLink()).toHaveAttribute('aria-disabled', 'true')
  })

  it('추천 질문 패널을 열면 칩과 함께 숨겨진다', async () => {
    renderView()
    await screen.findByText('q1 질문')
    fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: false }))
    expect(screen.queryByRole('link', { name: '변론 종료' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '추천 질문' })).toBeInTheDocument()
  })

  it('활성일 때 누르면 판결 화면(/cases/case-1/decision)으로 이동만 한다', async () => {
    thread = [{ question: question('q1'), answer: { action: 'answer', text: '있었다' } }]
    renderView()
    await waitFor(() => expect(finishLink()).toHaveAttribute('aria-disabled', 'false'))
    fireEvent.click(finishLink())

    expect(await screen.findByRole('heading', { name: '판결 화면' })).toBeInTheDocument()
    expect(submitDefenseAnswer).not.toHaveBeenCalled()
  })
})
