import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

/** 종결된 사건 상세(`GET /cases/{id}`) */
const closedCase = {
  id: 'case-1',
  case_number: '2026-001',
  status: 'closed',
  title: '회의 발표 사건',
  thought: '나는 쓸모없어.',
  final_statement: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
  emotion: { type: 'anxiety', intensity: 70 },
  emotion_after: { type: 'anxiety', intensity: 40 },
  created_at: '2026-11-06T03:00:00.000Z',
}

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, queryClient }
}

describe('게시판 공유 화면', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(apiClient.get)
      .mockReset()
      .mockImplementation(async (url) => {
        if (url === '/cases/case-1') return { data: closedCase }
        if (url === '/board/posts') return { data: { items: [], next_cursor: null } }
        throw Object.assign(new Error('not found'), { response: { status: 404 } })
      })
    vi.mocked(apiClient.post)
      .mockReset()
      .mockResolvedValue({
        data: {
          id: 'post-1',
          status: 'pending_review',
          visibility: 'public',
          created_at: '2026-11-06T03:00:00Z',
        },
      })
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

  it('전체 공개를 고르면 비밀번호 없이 POST /cases/{id}/posts로 게시하고 완료 화면으로 이동한다', async () => {
    renderAt('/cases/case-1/share')

    fireEvent.click(await screen.findByRole('radio', { name: /전체 공개/ }))
    expect(screen.queryByLabelText('비밀번호 설정')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('heading', { name: '게시가 완료되었어요!' })).toBeInTheDocument()
    expect(screen.getByText('재판 결과가 공유되었습니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/community')
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/posts', {
      visibility: 'public',
      title: '회의 발표 사건',
      body: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
    })
  })

  it('비공개를 고르면 비밀번호 칸이 나타나고, 규칙에 맞아야 게시할 수 있다', async () => {
    const { router, queryClient } = renderAt('/cases/case-1/share')

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
    expect(apiClient.post).toHaveBeenCalledWith(
      '/cases/case-1/posts',
      expect.objectContaining({ visibility: 'password_protected', password: 'long-enough-pw' }),
    )
    // 비밀번호는 요청 본문에만 있고 주소·캐시·저장소에는 남지 않는다.
    const { location } = router.state
    expect(`${location.pathname}${location.search}`).not.toContain('long-enough-pw')
    expect(JSON.stringify(location.state ?? null)).not.toContain('long-enough-pw')
    expect(JSON.stringify({ ...localStorage })).not.toContain('long-enough-pw')
    const cached = [
      ...queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data),
      ...queryClient
        .getMutationCache()
        .getAll()
        .map((mutation) => mutation.state.variables),
    ]
    expect(JSON.stringify(cached)).not.toContain('long-enough-pw')
  })

  it('게시 응답이 위기 안내(support_required)면 위기 안내 화면으로 replace 이동한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { outcome: 'support_required', support: { message: '...', contacts: [] } },
    })
    const { router } = renderAt('/cases/case-1/share')

    fireEvent.click(await screen.findByRole('radio', { name: /전체 공개/ }))
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/support')
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('게시에 실패하면 화면에 남아 오류를 보여준다', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('network'))
    renderAt('/cases/case-1/share')

    fireEvent.click(await screen.findByRole('radio', { name: /전체 공개/ }))
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('게시하지 못했어요')
    await waitFor(() => expect(screen.getByRole('button', { name: '게시하기' })).toBeEnabled())
  })

  it('전체 공개로 바꾸면 비밀번호 칸이 사라진다', async () => {
    renderAt('/cases/sample/share')

    fireEvent.click(await screen.findByRole('radio', { name: /비공개/ }))
    expect(screen.getByLabelText('비밀번호 설정')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /전체 공개/ }))
    expect(screen.queryByLabelText('비밀번호 설정')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '게시하기' })).toBeEnabled()
  })

  it('예시 사건(sample)은 서버에 게시하지 않고 완료 화면으로 간다', async () => {
    renderAt('/cases/sample/share')

    fireEvent.click(await screen.findByRole('radio', { name: /전체 공개/ }))
    fireEvent.click(screen.getByRole('button', { name: '게시하기' }))

    expect(await screen.findByRole('heading', { name: '게시가 완료되었어요!' })).toBeInTheDocument()
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('없는 사건(서버 404)이면 안내 문구와 홈 링크를 보여준다', async () => {
    renderAt('/cases/no-such-case/share')

    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    // 제목줄의 홈 아이콘과 안내 문구 아래의 링크, 두 곳에 홈으로 가는 링크가 있다.
    expect(screen.getAllByRole('link', { name: '홈으로 가기' })).toHaveLength(2)
  })
})
