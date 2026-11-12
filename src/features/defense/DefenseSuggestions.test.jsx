import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import chevronDownUrl from '@/assets/defense/chevron-down.svg'
import chevronUpUrl from '@/assets/defense/chevron-up.svg'
import { apiClient } from '@/lib/apiClient'
import { DefenseView } from './index'
import {
  getMockThread,
  recordMockAnswer,
  resetMockThread,
  simplifyMockQuestion,
} from './mocks/defenseMocks'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const question = { id: 'q2', sequence: 2, prompt: '그때 어떤 기분이었나요?', revision: 0 }

const renderView = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <DefenseView caseId="case-1" />
      </MemoryRouter>
    </QueryClientProvider>,
  )

/** 질문을 불러온 뒤 "추천 질문" 칩을 눌러 패널을 연다. */
const openPanel = async () => {
  renderView()
  await screen.findByText(question.prompt)
  const chip = screen.getByRole('button', { name: '추천 질문', expanded: false })
  chip.focus()
  fireEvent.click(chip)
  return { chip, panel: screen.getByRole('region', { name: '추천 질문' }) }
}

describe('추천 질문 패널', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { case_number: '2026-031' } })
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.put).mockReset()
    vi.mocked(apiClient.post).mockImplementation(async (url, body) =>
      url.endsWith('/simplify')
        ? { data: { prompt: `쉬운 문장 ${body.revision + 1}`, revision: body.revision + 1 } }
        : { data: question },
    )
    vi.mocked(apiClient.put).mockResolvedValue({ data: {} })
  })

  it('칩을 누르면 패널이 열리고, 보기 3개와 ∧ 화살표가 보이며 입력창은 숨겨진다', async () => {
    const { chip, panel } = await openPanel()

    expect(chip).toHaveAttribute('aria-controls', panel.id)
    const toggle = screen.getByRole('button', { name: '추천 질문', expanded: true })
    expect(toggle).toHaveAttribute('aria-controls', panel.id)
    expect(toggle.querySelector('img')).toHaveAttribute('src', chevronUpUrl)
    expect(chip.querySelector('img')).toHaveAttribute('src', chevronDownUrl)
    for (const label of ['질문을 쉽게 바꿔주세요.', '떠오르지 않아요.', '이 질문 건너뛰기']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByLabelText('답변')).not.toBeVisible()
  })

  it('열리면 제목 버튼으로 포커스가 오고, 대화 스크롤을 막는다', async () => {
    await openPanel()
    expect(screen.getByRole('button', { name: '추천 질문', expanded: true })).toHaveFocus()
    expect(screen.getByRole('list', { name: '변론 대화' }).parentElement).toHaveClass(
      'overflow-hidden',
    )
  })

  it.each([
    [
      '제목 버튼',
      () => fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: true })),
    ],
    ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    [
      '흐린 영역',
      () => fireEvent.click(screen.getByRole('region', { name: '추천 질문' }).previousSibling),
    ],
  ])('%s로 닫으면 입력창이 다시 보이고 칩으로 포커스가 돌아온다', async (_, close) => {
    const { chip } = await openPanel()
    close()
    expect(screen.queryByRole('region', { name: '추천 질문' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('답변')).toBeVisible()
    expect(chip).toHaveFocus()
    expect(screen.getByRole('list', { name: '변론 대화' }).parentElement).toHaveClass(
      'overflow-y-auto',
    )
  })

  it('"질문을 쉽게 바꿔주세요."는 기존 질문을 두고 쉬운 문장을 새 AI 말풍선으로 붙인다', async () => {
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: '질문을 쉽게 바꿔주세요.' }))

    expect(screen.queryByRole('region', { name: '추천 질문' })).not.toBeInTheDocument()
    expect(await screen.findByText('쉬운 문장 1')).toBeInTheDocument()
    expect(screen.getByText(question.prompt)).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/defense/questions/q2/simplify', {
      revision: 0,
    })
  })

  it('쉽게 바꾸기를 2번 쓰면 그 보기는 비활성화된다', async () => {
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: '질문을 쉽게 바꿔주세요.' }))
    await screen.findByText('쉬운 문장 1')
    fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: false }))
    fireEvent.click(screen.getByRole('button', { name: '질문을 쉽게 바꿔주세요.' }))
    await screen.findByText('쉬운 문장 2')
    // 두 번째 요청은 올라간 revision(1)으로 보낸다
    expect(apiClient.post).toHaveBeenLastCalledWith('/cases/case-1/defense/questions/q2/simplify', {
      revision: 1,
    })

    fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: false }))
    expect(screen.getByRole('button', { name: '질문을 쉽게 바꿔주세요.' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '떠오르지 않아요.' })).toBeEnabled()
  })

  it.each([
    ['떠오르지 않아요.', 'not_sure'],
    ['이 질문 건너뛰기', 'skip'],
  ])('"%s"는 action %s와 최신 revision으로 답한다(글은 보내지 않는다)', async (label, action) => {
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: label }))

    expect(screen.queryByRole('region', { name: '추천 질문' })).not.toBeInTheDocument()
    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/defense/questions/q2/answer', {
        action,
        revision: 0,
      }),
    )
  })

  it('보기는 키보드로 고를 수 있는 버튼이고, 첫 보기만 하늘색이다', async () => {
    await openPanel()
    const [first, second, third] = [
      '질문을 쉽게 바꿔주세요.',
      '떠오르지 않아요.',
      '이 질문 건너뛰기',
    ].map((name) => screen.getByRole('button', { name }))
    expect(first).toHaveClass('bg-bubble')
    expect(second).toHaveClass('bg-surface')
    expect(third).toHaveClass('bg-surface')
    second.focus()
    expect(second).toHaveFocus()
  })
})

describe('변론 목업 (보기 동작 확인용)', () => {
  beforeEach(() => {
    resetMockThread()
  })

  it('답하지 않은 두 번째 질문이 있다', () => {
    const open = getMockThread().find((item) => item.question && !item.answer)
    expect(open.question.id).toBe('q2')
  })

  it('건너뛰기·떠오르지 않아요로 답하면 다음 질문이 붙고, 질문은 3개까지만 나온다', () => {
    recordMockAnswer('q2', { action: 'skip' })
    expect(getMockThread().at(-1).question.id).toBe('q3')
    recordMockAnswer('q3', { action: 'not_sure' })
    expect(getMockThread().filter((item) => item.question)).toHaveLength(3)
    expect(getMockThread().every((item) => !item.question || item.answer)).toBe(true)
  })

  it('쉽게 바꾸면 순번은 그대로, revision만 오르고 문장이 쌓인다', () => {
    const first = simplifyMockQuestion('q2')
    const second = simplifyMockQuestion('q2')
    expect([first.revision, second.revision]).toEqual([1, 2])
    const q2 = getMockThread().find((item) => item.question?.id === 'q2').question
    expect(q2.sequence).toBe(2)
    expect(q2.simplifiedPrompts).toEqual([first.prompt, second.prompt])
  })
})
