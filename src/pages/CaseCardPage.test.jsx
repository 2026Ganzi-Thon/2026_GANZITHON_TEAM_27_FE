import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/routes/router'

// jsdom에는 Canvas가 없으므로 카드 그리기는 가짜 PNG를 돌려주게 한다. 그리기 자체는 브라우저에서 확인한다.
vi.mock('@/features/card/renderCaseCard', () => ({
  renderCaseCard: vi.fn(async () => ({
    blob: new Blob(['png'], { type: 'image/png' }),
    width: 315,
    height: 459,
  })),
}))

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

describe('사건 카드 화면', () => {
  beforeEach(() => {
    localStorage.clear()
    URL.createObjectURL = vi.fn(() => 'blob:card')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete navigator.canShare
    delete navigator.share
  })

  it('제목과 카드 미리보기, 이미지 저장·공유하기·확인 버튼을 보여준다', async () => {
    renderAt('/cases/sample/card')

    expect(
      await screen.findByRole('heading', { name: /사건 카드가\s*완성되었어요/ }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: /#2026-031.*나는 쓸모없어.*불안 70% → 40%/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이미지 저장' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '공유하기' })).toBeEnabled()
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/')
  })

  it('이미지 저장을 누르면 파일로 저장하고 안내 문구를 보여준다', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderAt('/cases/sample/card')

    fireEvent.click(await screen.findByRole('button', { name: '이미지 저장' }))

    expect(click).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('이미지를 저장했어요.')).toBeInTheDocument()
  })

  it('공유하기를 누르면 이미지를 공유하고, 지원하지 않는 브라우저에서는 저장을 안내한다', async () => {
    renderAt('/cases/sample/card')
    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }))
    expect(
      await screen.findByText(
        '이 브라우저에서는 공유를 지원하지 않아요. 이미지 저장을 이용해 주세요.',
      ),
    ).toBeInTheDocument()

    navigator.canShare = () => true
    navigator.share = vi.fn().mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))
    expect(await screen.findByText('공유했어요.')).toBeInTheDocument()
    expect(navigator.share).toHaveBeenCalledTimes(1)
  })

  it('없는 사건이면 안내 문구와 홈 링크를 보여준다', async () => {
    renderAt('/cases/no-such-case/card')

    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
  })
})
