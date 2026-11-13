import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { DefenseSuggestions } from './components/DefenseSuggestions'
import { DefenseView } from './index'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const question = { id: 'q2', sequence: 2, prompt: '그때 어떤 기분이었나요?', revision: 0 }

/** "동작 줄이기" 설정을 흉내 낸다. reduce가 false면 모션이 켜진다. */
const mockReducedMotion = (reduce) => {
  window.matchMedia = vi.fn((query) => ({
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

const renderView = async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <DefenseView caseId="case-1" finishTo="/cases/case-1/decision" />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  await screen.findByText(question.prompt)
}

const chip = () => screen.getByRole('button', { name: '추천 질문', expanded: false })
const panel = () => screen.queryByRole('region', { name: '추천 질문' })
/** 패널 바깥 틀(inert가 붙는 요소) */
const panelFrame = () => panel()?.parentElement

/** 칩을 눌러 패널을 연다. */
const openPanel = () => {
  const button = chip()
  button.focus()
  fireEvent.click(button)
  return button
}

describe('추천 질문 패널 모션 (동작 줄이기 꺼짐)', () => {
  beforeEach(() => {
    mockReducedMotion(false)
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { case_number: '2026-031' } })
    vi.mocked(apiClient.post).mockReset().mockResolvedValue({ data: question })
    vi.mocked(apiClient.put).mockReset().mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    delete window.matchMedia
    vi.useRealTimers()
  })

  it('열면 패널이 바로 나타나고(올라오는 모션), 제목으로 포커스가 오며 입력창은 숨고 스크롤이 잠긴다', async () => {
    await renderView()
    openPanel()

    expect(panel()).toBeInTheDocument()
    expect(panelFrame()).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: '추천 질문', expanded: true })).toHaveFocus()
    expect(screen.getByLabelText('답변')).not.toBeVisible()
    expect(screen.getByRole('list', { name: '변론 대화' }).parentElement).toHaveClass(
      'overflow-hidden',
    )
  })

  it.each([
    [
      '제목',
      () => fireEvent.click(screen.getByRole('button', { name: '추천 질문', expanded: true })),
    ],
    ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['흐린 영역', () => fireEvent.click(panel().previousSibling)],
  ])(
    '%s로 닫으면 내려가는 모션이 끝난 뒤에 패널이 사라지고, 그때 입력창·칩 포커스가 돌아온다',
    async (_, close) => {
      await renderView()
      const button = openPanel()
      close()

      // 닫히는 중: 패널은 아직 있고 누를 수 없으며(inert), 입력창도 아직 숨어 있다.
      expect(panel()).toBeInTheDocument()
      expect(panelFrame()).toHaveAttribute('inert')
      expect(screen.getByLabelText('답변')).not.toBeVisible()

      // 카드의 시차 모션이 끝난 것만으로는 사라지지 않는다.
      fireEvent.transitionEnd(
        screen.getByRole('button', { name: '떠오르지 않아요.' }).closest('li'),
      )
      expect(panel()).toBeInTheDocument()

      // 시트가 다 내려가면 사라진다.
      fireEvent.transitionEnd(panel())
      expect(panel()).not.toBeInTheDocument()
      expect(screen.getByLabelText('답변')).toBeVisible()
      expect(button).toHaveFocus()
      expect(screen.getByRole('list', { name: '변론 대화' }).parentElement).toHaveClass(
        'overflow-y-auto',
      )
    },
  )

  it('보기를 고르면 같은 모션으로 닫히고, 닫히는 동안 다시 눌러도 한 번만 실행된다', async () => {
    await renderView()
    openPanel()
    const skip = screen.getByRole('button', { name: '이 질문 건너뛰기' })
    fireEvent.click(skip)
    fireEvent.click(skip) // 닫히는 중(inert)에 다시 누름

    expect(panel()).toBeInTheDocument()
    fireEvent.transitionEnd(panel())
    expect(panel()).not.toBeInTheDocument()
    await vi.waitFor(() => expect(apiClient.put).toHaveBeenCalledTimes(1))
  })

  it('transitionend가 오지 않아도 모션 시간이 지나면 패널을 없앤다(안전장치)', async () => {
    await renderView()
    vi.useFakeTimers()
    openPanel()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(panel()).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(panel()).not.toBeInTheDocument()
    expect(screen.getByLabelText('답변')).toBeVisible()
  })

  it('Esc를 빠르게 여러 번 눌러도 한 번만 닫히고 상태가 꼬이지 않는다', async () => {
    await renderView()
    const button = openPanel()
    for (let i = 0; i < 3; i += 1) fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.transitionEnd(panel())

    expect(panel()).not.toBeInTheDocument()
    expect(button).toHaveFocus()

    // 다시 열 수 있다.
    openPanel()
    expect(panel()).toBeInTheDocument()
    expect(panelFrame()).not.toHaveAttribute('inert')
  })
})

describe('추천 질문 패널 (닫히는 중 다시 열기)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('닫히는 중에 다시 열리면 사라지지 않고(onExited 없음) 다시 누를 수 있게 된다', () => {
    vi.useFakeTimers()
    const props = { id: 'p', onSelect: vi.fn(), onClose: vi.fn(), onExited: vi.fn() }
    const { rerender } = render(<DefenseSuggestions {...props} open />)
    rerender(<DefenseSuggestions {...props} open={false} />)
    expect(screen.getByRole('region').parentElement).toHaveAttribute('inert')

    rerender(<DefenseSuggestions {...props} open />)
    act(() => vi.advanceTimersByTime(1000))
    fireEvent.transitionEnd(screen.getByRole('region'))

    expect(props.onExited).not.toHaveBeenCalled()
    expect(screen.getByRole('region').parentElement).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: '추천 질문' })).toHaveFocus()
  })
})

describe('추천 질문 패널 모션 (동작 줄이기 켜짐)', () => {
  beforeEach(() => {
    mockReducedMotion(true)
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({ data: { case_number: '2026-031' } })
    vi.mocked(apiClient.post).mockReset().mockResolvedValue({ data: question })
    vi.mocked(apiClient.put).mockReset().mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    delete window.matchMedia
  })

  it('모션 없이 바로 열리고, 닫으면 바로 사라진다', async () => {
    await renderView()
    const button = openPanel()
    expect(panel()).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(panel()).not.toBeInTheDocument()
    expect(screen.getByLabelText('답변')).toBeVisible()
    expect(button).toHaveFocus()
  })

  it('패널 요소에는 동작 줄이기용 transition-none 클래스가 붙어 있다', async () => {
    await renderView()
    openPanel()
    expect(panel()).toHaveClass('motion-reduce:transition-none')
    expect(panel().previousSibling).toHaveClass('motion-reduce:transition-none')
  })
})
