import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

// 사건 접수 목업이 300ms 기다린다.
configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

/** 홈 → 사건 접수 순서로 기록을 쌓아 연다(뒤로 가기로 어디에 돌아가는지 보려고). */
const renderIntake = async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/', '/cases/new'],
    initialIndex: 1,
  })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await screen.findByLabelText(/자유롭게 적어주세요/)
  return router
}

/** 생각을 적고(감정 불안) "다음"을 누른다. */
const submit = (thought) => {
  fireEvent.change(screen.getByLabelText(/자유롭게 적어주세요/), { target: { value: thought } })
  fireEvent.click(screen.getByRole('radio', { name: '불안' }))
  fireEvent.click(screen.getByRole('button', { name: '다음' }))
}

describe('사건 접수 → 기소 화면', () => {
  beforeEach(() => {
    localStorage.clear()
    // 기소 화면의 데이터 불러오기는 이 테스트의 관심사가 아니므로 불러오는 중으로 둔다.
    vi.mocked(apiClient.get)
      .mockReset()
      .mockReturnValue(new Promise(() => {}))
    vi.mocked(apiClient.post)
      .mockReset()
      .mockReturnValue(new Promise(() => {}))
  })

  it('접수에 성공하면 새 사건의 기소 화면(/cases/{caseId}/prosecution)으로 replace 이동한다', async () => {
    const router = await renderIntake()
    submit('회의에서 발표를 망쳤다')

    expect(await screen.findByRole('heading', { name: '기소' })).toBeInTheDocument()
    const [saved] = JSON.parse(localStorage.getItem('mock-case-files'))
    expect(router.state.location.pathname).toBe(`/cases/${saved.id}/prosecution`)
    expect(router.state.historyAction).toBe('REPLACE')

    // 뒤로 가기를 해도 접수 입력창이 아니라 그 전(홈)으로 간다(같은 사건을 다시 접수하지 않는다).
    await router.navigate(-1)
    expect(router.state.location.pathname).toBe('/')
    expect(JSON.parse(localStorage.getItem('mock-case-files'))).toHaveLength(1)
  })

  it('기소 화면의 < 버튼은 그대로 휴정 모달을 띄운다', async () => {
    await renderIntake()
    submit('회의에서 발표를 망쳤다')
    await screen.findByRole('heading', { name: '기소' })

    fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }))
    expect(screen.getByRole('dialog', { name: '지금은 잠시 휴정할까요?' })).toBeInTheDocument()
  })

  it('위기 상황(support_required)이면 사건을 만들지 않고 접수 화면에 상담 안내를 보여준다(기존 동작)', async () => {
    const router = await renderIntake()
    submit('요즘 자살 생각이 든다')

    expect(await screen.findByRole('alert')).toHaveTextContent('109')
    expect(router.state.location.pathname).toBe('/cases/new')
    expect(localStorage.getItem('mock-case-files')).toBeNull()
  })
})
