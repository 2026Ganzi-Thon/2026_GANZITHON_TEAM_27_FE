import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routes } from '@/routes/router'

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('router', () => {
  it('홈 주소에서 홈 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: '체포하겠어' })).toBeInTheDocument()
  })

  it('없는 주소에서는 찾을 수 없음 화면과 홈 링크를 보여준다', async () => {
    renderAt('/no-such-page')
    expect(
      await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
  })
})
