import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const savedPosts = () => JSON.parse(localStorage.getItem('mock-board-posts') ?? '[]')

describe('게시판 공유 화면', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('제목줄과 공개 범위 선택, 게시하기 버튼을 보여주고 처음에는 아무것도 선택되어 있지 않다', async () => {
    renderAt('/cases/sample/share')

    expect(await screen.findByRole('heading', { name: '게시판 공유하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')

    const radios = await screen.findAllByRole('radio')
    expect(radios).toHaveLength(2)
    radios.forEach((radio) => expect(radio).not.toBeChecked())
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled()
    expect(screen.queryByLabelText('비밀번호 설정')).not.toBeInTheDocument()
  })

  it('전체 공개를 고르면 비밀번호 없이 게시하고 완료 화면으로 이동한다', async () => {
    renderAt('/cases/sample/share')

    fireEvent.click(await screen.findByRole('radio', { name: /전체 공개/ }))
    expect(screen.queryByLabelText('비밀번호 설정')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('heading', { name: '게시가 완료되었어요!' })).toBeInTheDocument()
    expect(screen.getByText('재판 결과가 공유되었습니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/community')
    expect(savedPosts()).toHaveLength(1)
    expect(savedPosts()[0].visibility).toBe('public')
  })

  it('비공개를 고르면 비밀번호 칸이 나타나고, 규칙에 맞아야 게시할 수 있다', async () => {
    renderAt('/cases/sample/share')

    fireEvent.click(await screen.findByRole('radio', { name: /비공개/ }))
    const input = screen.getByLabelText('비밀번호 설정')
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled()

    fireEvent.change(input, { target: { value: 'abc' } })
    expect(await screen.findByText('비밀번호는 6자 이상이어야 해요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled()

    fireEvent.change(input, { target: { value: 'long-enough-pw' } })
    expect(screen.queryByText('비밀번호는 6자 이상이어야 해요.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('heading', { name: '게시가 완료되었어요!' })).toBeInTheDocument()
    const [post] = savedPosts()
    expect(post.visibility).toBe('password_protected')
    expect(post.has_password).toBe(true)
    expect(JSON.stringify(post)).not.toContain('long-enough-pw')
  })

  it('전체 공개로 바꾸면 비밀번호 칸이 사라진다', async () => {
    renderAt('/cases/sample/share')

    fireEvent.click(await screen.findByRole('radio', { name: /비공개/ }))
    expect(screen.getByLabelText('비밀번호 설정')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /전체 공개/ }))
    expect(screen.queryByLabelText('비밀번호 설정')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '게시하기' })).toBeEnabled()
  })

  it('없는 사건이면 안내 문구와 홈 링크를 보여준다', async () => {
    renderAt('/cases/no-such-case/share')

    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    // 제목줄의 홈 아이콘과 안내 문구 아래의 링크, 두 곳에 홈으로 가는 링크가 있다.
    expect(screen.getAllByRole('link', { name: '홈으로 가기' })).toHaveLength(2)
  })
})
