import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { routes } from '@/routes/router'

// lazy 페이지를 여러 번 넘나들므로 비동기 대기 시간을 넉넉히 둔다.
configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const draftResponse = {
  status: 'decision_review',
  decision: {
    type: 'reframed',
    reported_facts: ['오늘 발표는 아쉬웠지만 긴장한 것은 사실입니다.'],
    unsupported_claims: ['“나는 쓸모없는 사람이다" 라는 생각은 근거가 부족합니다'],
    suggested_statement: '오늘은 실수했지만 나는 여전히 잘하고 있고, 다음엔 더 잘할 수 있다.',
    next_action: null,
    version: 1,
  },
}

/** 실제 라우트로 주소를 연다. 화면 사이 이동과 넘겨받은 내용(location.state)까지 확인하려고 라우터 전체를 쓴다. */
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

const pathOf = (router) => router.state.location.pathname

describe('법정 화면 연결: 변론 → 판결 → 감정 변화', () => {
  let resolvePut

  beforeEach(() => {
    // 사건 조회: 접수 때 감정은 불안 70
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValue({
        data: {
          id: 'case-7',
          case_number: '2026-031',
          emotion: { type: 'anxiety', intensity: 70 },
        },
      })
    // 판결 초안은 바로 주고, 변론 질문은 하나(미응답)를 준다.
    vi.mocked(apiClient.post)
      .mockReset()
      .mockImplementation(async (url) =>
        url.endsWith('/decision')
          ? { data: draftResponse }
          : { data: { id: 'q1', sequence: 1, prompt: '첫 질문', revision: 0 } },
      )
    vi.mocked(apiClient.put)
      .mockReset()
      .mockImplementation(() => new Promise((resolve) => (resolvePut = resolve)))
  })

  it('변론 화면의 "변론 종료"는 같은 사건의 판결 화면(/cases/case-7/decision)으로 간다', async () => {
    renderAt('/cases/case-7/defense')
    await screen.findByText('첫 질문')
    expect(screen.getByRole('link', { name: '변론 종료' })).toHaveAttribute(
      'href',
      '/cases/case-7/decision',
    )
  })

  it('"사건파일 저장하기"는 판결을 확정하지 않고 감정 변화 화면(/cases/case-7/emotion)으로 간다', async () => {
    const router = renderAt('/cases/case-7/decision')
    fireEvent.click(await screen.findByRole('button', { name: '사건파일 저장하기' }))

    expect(await screen.findByRole('heading', { name: '감정 확인' })).toBeInTheDocument()
    expect(pathOf(router)).toBe('/cases/case-7/emotion')
    expect(router.state.location.state).toEqual({
      decision: {
        decision_type: 'reframed',
        final_statement: draftResponse.decision.suggested_statement,
      },
    })
    expect(apiClient.put).not.toHaveBeenCalled()
  })

  it('감정 변화 "다음"은 판결에서 직접 고친 진술문·판결 유형·지금 감정을 함께 판결 확정으로 보낸다', async () => {
    const router = renderAt('/cases/case-7/decision')

    fireEvent.click(await screen.findByRole('button', { name: '수정된 생각 직접 수정' }))
    fireEvent.change(screen.getByRole('textbox', { name: '수정된 생각 직접 수정' }), {
      target: { value: '  나는 다음에 더 잘할 수 있다.  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '사건파일 저장하기' }))
    await screen.findByRole('heading', { name: '감정 확인' })
    expect(apiClient.put).not.toHaveBeenCalled()

    // 접수 때 감정을 불러온 뒤 지금 감정을 40 → 30으로 낮춘다(← 키는 10씩 줄인다).
    const slider = screen.getByRole('slider', { name: '지금 감정의 강도' })
    await waitFor(() => expect(screen.queryByText(/불러오는 중/)).not.toBeInTheDocument())
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    const value = Number(slider.getAttribute('aria-valuenow'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith('/cases/case-7/decision/final', {
        decision_type: 'reframed',
        final_statement: '나는 다음에 더 잘할 수 있다.',
        emotion_after: { type: 'anxiety', intensity: value },
      }),
    )

    // 요청 중에는 다시 누를 수 없다.
    const busy = screen.getByRole('button', { name: '저장하는 중…' })
    expect(busy).toBeDisabled()
    fireEvent.click(busy)
    expect(apiClient.put).toHaveBeenCalledTimes(1)

    // 성공하면 (행동 제안이 아직 없어) 홈으로 간다.
    resolvePut({ data: { status: 'closed' } })
    await waitFor(() => expect(pathOf(router)).toBe('/'))
  })

  it('판결 확정에 실패하면 감정 변화 화면에 남아 오류를 보여주고 다시 누를 수 있다', async () => {
    vi.mocked(apiClient.put).mockReset().mockRejectedValue(new Error('network'))
    const router = renderAt('/cases/case-7/decision')
    fireEvent.click(await screen.findByRole('button', { name: '사건파일 저장하기' }))
    await screen.findByRole('heading', { name: '감정 확인' })

    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(pathOf(router)).toBe('/cases/case-7/emotion')
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()
  })

  it('판결 내용 없이 감정 변화 화면을 바로 열면 "다음"이 판결을 확정하지 않고 판결 화면으로 돌려보낸다', async () => {
    const router = renderAt('/cases/case-7/emotion')
    await screen.findByRole('heading', { name: '감정 확인' })

    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() => expect(pathOf(router)).toBe('/cases/case-7/decision'))
    expect(apiClient.put).not.toHaveBeenCalled()
  })
})
