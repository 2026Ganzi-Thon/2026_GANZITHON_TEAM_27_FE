import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

// 접수 요청이 실패하는 상황을 만들려고 사건 접수 함수만 실패하게 바꾼다(동료 코드는 그대로 둔다).
vi.mock('@/features/case/api/createCase', () => ({
  createCase: vi.fn(() => Promise.reject(new Error('network'))),
}))

describe('사건 접수 실패', () => {
  it('접수에 실패하면 이동하지 않고 접수 화면에 남아 입력한 글을 지우지 않는다', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/cases/new'] })
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    const textarea = await screen.findByLabelText(/자유롭게 적어주세요/)
    fireEvent.change(textarea, { target: { value: '회의에서 발표를 망쳤다' } })
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cases/new')
    expect(screen.getByLabelText(/자유롭게 적어주세요/)).toHaveValue('회의에서 발표를 망쳤다')
  })
})
