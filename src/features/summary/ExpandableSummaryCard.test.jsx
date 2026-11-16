import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ExpandableSummaryCard } from './components/ExpandableSummaryCard'

const SHORT = '그럴 수 있다.'
const LONG =
  '한 번의 실수로 나의 가치를 판단할 수는 없다. 발표는 아쉬웠지만 준비한 과정은 의미가 있었고, 다음 발표에서는 더 차분하게 말할 수 있을 것이다.'

// jsdom은 글자 폭을 계산하지 않으므로, 글이 30자를 넘으면 한 줄에서 잘린다고 가정한다.
const originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')

const renderCard = (content) =>
  render(
    <>
      <ExpandableSummaryCard id="final" title="최종판결" content={content} tone="ink" />
      <section aria-label="다음 카드">사건 유형</section>
    </>,
  )

const toggle = () => screen.queryByRole('button', { name: /최종판결 (펼치기|접기)/ })

describe('최종판결 펼치기 토글', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get() {
        return (this.textContent?.length ?? 0) > 30 ? 600 : 100
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 327,
    })
  })

  afterEach(() => {
    if (originalScrollWidth)
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', originalScrollWidth)
    if (originalClientWidth)
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth)
  })

  it('짧은 글(카드에 다 들어감)이면 토글을 보여주지 않는다', () => {
    renderCard(SHORT)
    expect(screen.getByText(SHORT)).toHaveClass('truncate')
    expect(toggle()).not.toBeInTheDocument()
  })

  it('긴 글이면 한 줄(말줄임)로 시작하고 "최종판결 펼치기" 버튼이 내용과 연결되어 있다', () => {
    renderCard(LONG)
    const button = screen.getByRole('button', { name: '최종판결 펼치기' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'final')
    expect(document.getElementById('final')).toHaveTextContent(LONG)
    expect(document.getElementById('final')).toHaveClass('truncate')
  })

  it('누르면 전체 글이 보이게 펼쳐지고(aria-expanded true, "접기"), 다시 누르면 접힌다', () => {
    renderCard(LONG)
    fireEvent.click(screen.getByRole('button', { name: '최종판결 펼치기' }))

    const expanded = screen.getByRole('button', { name: '최종판결 접기' })
    expect(expanded).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('final')).not.toHaveClass('truncate')
    expect(document.getElementById('final')).toHaveClass('whitespace-pre-wrap')

    fireEvent.click(expanded)
    expect(screen.getByRole('button', { name: '최종판결 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(document.getElementById('final')).toHaveClass('truncate')
  })

  it('카드의 글 부분을 눌러도 펼치고 접는다(버튼과 두 번 겹쳐 실행되지 않는다)', () => {
    renderCard(LONG)
    fireEvent.click(document.getElementById('final'))
    expect(screen.getByRole('button', { name: '최종판결 접기' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('heading', { name: '최종판결' }))
    expect(screen.getByRole('button', { name: '최종판결 펼치기' })).toBeInTheDocument()
  })

  it('키보드로 쓸 수 있도록 포커스가 가는 버튼이다(Enter·Space는 버튼 기본 동작)', () => {
    renderCard(LONG)
    const button = screen.getByRole('button', { name: '최종판결 펼치기' })
    button.focus()
    expect(button).toHaveFocus()
  })

  it('카드는 흐름 배치라서 펼쳐도 다음 카드가 그 뒤에 이어진다(겹치는 고정 위치가 없다)', () => {
    renderCard(LONG)
    const card = screen.getByRole('heading', { name: '최종판결' }).closest('section')
    fireEvent.click(screen.getByRole('button', { name: '최종판결 펼치기' }))

    expect(card.className).not.toMatch(/\babsolute\b/)
    expect(card.className).toMatch(/min-h-18\.5/)
    expect(card.nextElementSibling).toHaveAccessibleName('다음 카드')
  })
})
