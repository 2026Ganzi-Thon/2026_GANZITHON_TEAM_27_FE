import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ClosingView } from './index'

const renderView = () =>
  render(
    <MemoryRouter>
      <ClosingView summaryTo="/summary" emotionTo="/emotion" confirmTo="/" />
    </MemoryRouter>,
  )

describe('ClosingView', () => {
  it('Figma 문구를 그대로 보여준다', () => {
    renderView()
    expect(screen.getByRole('heading', { name: '사건이 종결되었습니다' })).toBeInTheDocument()
    expect(screen.getByText(/지금까지의 재판을\s+확인해보세요/)).toBeInTheDocument()
  })

  it('두 카드는 제목·설명이 이름인 링크로 각 주소로 이동한다', () => {
    renderView()
    expect(
      screen.getByRole('link', { name: '사건파일 요약 처음 든 생각부터, 최종 판결까지' }),
    ).toHaveAttribute('href', '/summary')
    expect(
      screen.getByRole('link', { name: '감정 변화 확인 재판 전과 후의 감정 비교' }),
    ).toHaveAttribute('href', '/emotion')
  })

  it('확인은 링크로 다음 주소로 이동한다', () => {
    renderView()
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/')
  })
})
