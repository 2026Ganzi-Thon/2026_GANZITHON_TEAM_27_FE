import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routes } from '@/routes/router'

// 기소 화면이 API를 부르므로 네트워크 대신 끝나지 않는 요청으로 로딩 상태를 유지한다.
vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(() => new Promise(() => {})),
    post: vi.fn(() => new Promise(() => {})),
    put: vi.fn(),
  },
}))

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('router', () => {
  it('홈 주소에서 홈 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: '체포하겠어' })).toBeInTheDocument()
  })

  it('기소 주소에서 기소 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/cases/case-1/prosecution')
    expect(await screen.findByRole('heading', { name: '기소' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('기소장을 작성하고 있어요')
  })

  it('없는 주소에서는 찾을 수 없음 화면과 홈 링크를 보여준다', async () => {
    renderAt('/no-such-page')
    expect(
      await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
  })
})
