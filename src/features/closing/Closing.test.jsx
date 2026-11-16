import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ClosingView } from './index'

const renderView = () =>
  render(
    <MemoryRouter>
      <ClosingView confirmTo="/" />
    </MemoryRouter>,
  )

describe('ClosingView', () => {
  it('Figma 문구를 그대로 보여준다', () => {
    renderView()
    expect(screen.getByRole('heading', { name: '사건이 종결되었습니다' })).toBeInTheDocument()
    expect(screen.getByText(/지금까지의 재판을\s+확인해보세요/)).toBeInTheDocument()
  })

  it('종결 카드 대신 안내와 확인 링크만 보여준다', () => {
    renderView()
    expect(
      screen.queryByRole('link', { name: /사건파일 요약|감정 변화 확인/ }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('확인은 링크로 다음 주소로 이동한다', () => {
    renderView()
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/')
  })
})
