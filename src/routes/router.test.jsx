import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/routes/router'

// 기소 화면이 API를 부르므로 네트워크 대신 끝나지 않는 요청으로 로딩 상태를 유지한다.
vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(() => new Promise(() => {})),
    post: vi.fn(() => new Promise(() => {})),
    put: vi.fn(),
  },
}))

// mock 서버가 단계마다 잠깐(300ms) 기다리므로, 느린 환경(CI)에서도 통과하도록 비동기 대기 시간을 늘린다.
configure({ asyncUtilTimeout: 5000 })

/** 홈 화면이 사건 목록을 불러오므로 테스트마다 새 QueryClient로 감싼다. */
const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('router', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('홈 주소에서 홈 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Thought Court' })).toBeInTheDocument()
    expect(await screen.findByText('아직 접수한 사건이 없어요.')).toBeInTheDocument()
  })

  it('기소 주소에서 기소 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/cases/case-1/prosecution')
    expect(await screen.findByRole('heading', { name: '기소' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('기소장을 작성하고 있어요')
  })

  it('변론 주소에서 변론(AI 챗봇) 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/cases/case-1/defense')
    expect(await screen.findByRole('heading', { name: '변론' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('질문을 준비하고 있어요')
  })

  it('없는 주소에서는 찾을 수 없음 화면과 홈 링크를 보여준다', async () => {
    renderAt('/no-such-page')
    expect(
      await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
  })

  it('사건 접수 화면에서는 처음에 아무 감정도 선택되어 있지 않다', async () => {
    renderAt('/cases/new')

    const radios = await screen.findAllByRole('radio')
    expect(radios).toHaveLength(6)
    radios.forEach((radio) => expect(radio).not.toBeChecked())
    expect(screen.getByRole('slider', { name: '감정의 강도' })).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: '분노' }))
    expect(screen.getByRole('radio', { name: '분노' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '불안' })).not.toBeChecked()
    expect(screen.getByRole('slider', { name: '감정의 강도' })).toBeEnabled()
  })

  it('사건을 접수하면 홈의 최근 사건파일에 사건이 나타난다', async () => {
    renderAt('/')

    fireEvent.click(await screen.findByRole('link', { name: '사건 접수하기' }))
    fireEvent.change(await screen.findByLabelText(/자유롭게 적어주세요/), {
      target: { value: '회의에서 발표를 망쳤다' },
    })
    fireEvent.click(screen.getByRole('radio', { name: '불안' }))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(await screen.findByRole('link', { name: '새 사건 접수하기' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /회의에서 발표를 망쳤다.*감정 변화 불안 40/ }),
    ).toBeInTheDocument()
  })

  it('감정을 고르지 않아도 사건을 접수할 수 있다', async () => {
    renderAt('/cases/new')

    fireEvent.change(await screen.findByLabelText(/자유롭게 적어주세요/), {
      target: { value: '친구가 답장이 없다' },
    })
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(
      await screen.findByRole('button', { name: /친구가 답장이 없다.*감정 기록 없음/ }),
    ).toBeInTheDocument()
  })

  it('사건 목록(court) 화면에서 접수한 사건을 목록으로 보여준다', async () => {
    localStorage.setItem(
      'mock-case-files',
      JSON.stringify([
        {
          id: 'case-1',
          title: '회의 발표 사건',
          thought: '회의에서 발표를 망쳤다',
          emotion: { type: 'anxiety', intensity: 80 },
          emotion_after: { type: 'anxiety', intensity: 40 },
          status: 'closed',
          created_at: '2026-07-20T03:00:00.000Z',
        },
      ]),
    )
    renderAt('/court')

    expect(await screen.findByRole('heading', { name: '사건 목록' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '최근 사건파일' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /회의 발표 사건.*July 20,2026.*불안 80 → 40/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /court/ })).toHaveAttribute('aria-current', 'page')
  })

  it('사건이 없으면 사건 목록(court) 화면에 빈 상태를 보여준다', async () => {
    renderAt('/court')
    expect(await screen.findByText('아직 접수한 사건이 없어요.')).toBeInTheDocument()
  })

  it('판결 주소에서 판결 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/cases/case-1/decision')
    expect(await screen.findByRole('heading', { name: '판결' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('판결문을 작성하고 있어요')
  })

  it('감정 변화 주소에서 감정 변화 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/cases/case-1/emotion')
    expect(await screen.findByRole('heading', { name: '감정 확인' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: '지금 감정의 강도' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
  })

  it('행동 제안 주소에서 행동 제안 화면을 보여준다', async () => {
    renderAt('/cases/sample/action')
    expect(await screen.findByRole('heading', { name: 'YOUR NEXTMOVE.' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'CHOOSE YOUR ACTION' })).toBeInTheDocument()
  })

  it('위기 안내 주소에서 위기 안내 화면을 lazy loading으로 보여준다', async () => {
    renderAt('/support')
    expect(await screen.findByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '자살예방 상담전화 109에 전화 걸기' })).toHaveAttribute(
      'href',
      'tel:109',
    )
  })
})
