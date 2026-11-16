import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, expect, it } from 'vitest'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

beforeEach(() => {
  localStorage.clear()
})

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

it('글쓰기에서 공개 글을 등록하면 게시판 목록으로 가서 그 글이 보인다', async () => {
  const router = renderAt('/community/write')
  fireEvent.change(await screen.findByRole('textbox', { name: '제목' }), {
    target: { value: '오늘의 생각' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), {
    target: { value: '기록할 내용' },
  })
  fireEvent.click(screen.getByRole('radio', { name: '공개', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))

  expect(await screen.findByText('오늘의 생각')).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/community/posts')
})

it('글쓰기에서 비공개 글을 등록하면 게시판 목록의 내 글만 보기에서 보인다', async () => {
  const router = renderAt('/community/write')
  fireEvent.change(await screen.findByRole('textbox', { name: '제목' }), {
    target: { value: '비밀 생각' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), { target: { value: '본문' } })
  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  fireEvent.change(await screen.findByLabelText('비밀번호'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))

  expect(await screen.findByText('아직 올라온 글이 없어요.')).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/community/posts')
  fireEvent.click(screen.getByRole('button', { name: /공개 범위/ }))
  fireEvent.click(await screen.findByRole('button', { name: '내 글만 보기' }))
  fireEvent.click(screen.getByRole('button', { name: '공개 범위 보기' }))
  expect(await screen.findByText('비밀 생각')).toBeInTheDocument()
})
