import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { DecisionView } from './index'

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

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

const renderView = () => {
  const onSave = vi.fn()
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <DecisionView caseId="case-1" onSave={onSave} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { onSave }
}

describe('DecisionView', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.put).mockReset()
  })

  it('판결 초안을 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('heading', { name: '판결' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('판결문을 작성하고 있어요')
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/decision')
  })

  it('판결 초안의 사실·과장된 부분과 수정된 생각을 보여준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draftResponse })
    renderView()

    expect(await screen.findByRole('img', { name: 'TRUE, BUT...' })).toBeInTheDocument()
    expect(screen.getByText('오늘 발표는 아쉬웠지만 긴장한 것은 사실입니다.')).toBeInTheDocument()
    expect(
      screen.getByText('“나는 쓸모없는 사람이다" 라는 생각은 근거가 부족합니다'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('오늘은 실수했지만 나는 여전히 잘하고 있고, 다음엔 더 잘할 수 있다.'),
    ).toBeInTheDocument()
  })

  it('입력 오류(422)면 다시 시도 버튼 없이 입력을 확인하라고 안내한다', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(httpError(422))
    renderView()

    expect(await screen.findByRole('alert')).toHaveTextContent('입력한 내용을 확인해 주세요.')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledTimes(1)
  })

  it('502 오류면 다시 시도 버튼으로 다시 요청한다', async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(httpError(502))
      .mockResolvedValueOnce({ data: draftResponse })
    renderView()

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('사실인 부분')).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledTimes(2)
  })

  it('다른 표현 버튼은 현재 version과 함께 재표현을 요청하고 새 문장으로 바꾼다', async () => {
    vi.mocked(apiClient.post).mockImplementation(async (url) =>
      url.endsWith('/rephrase')
        ? { data: { suggested_statement: '다음엔 더 잘할 수 있다.', version: 2 } }
        : { data: draftResponse },
    )
    renderView()

    fireEvent.click(await screen.findByRole('button', { name: '다른 표현으로 바꾸기' }))

    expect(await screen.findByText('다음엔 더 잘할 수 있다.')).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/decision/rephrase', {
      style: 'neutral',
      version: 1,
    })
  })

  it('사건파일 저장하기는 판결을 확정하지 않고, 직접 고친 문장과 판결 유형을 넘긴다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draftResponse })
    const { onSave } = renderView()

    fireEvent.click(await screen.findByRole('button', { name: '수정된 생각 직접 수정' }))
    fireEvent.change(screen.getByRole('textbox', { name: '수정된 생각 직접 수정' }), {
      target: { value: '  나는 다음에 더 잘할 수 있다.  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '사건파일 저장하기' }))

    expect(onSave).toHaveBeenCalledWith({
      decision_type: 'reframed',
      final_statement: '나는 다음에 더 잘할 수 있다.',
    })
    // 판결 확정(PUT decision/final)은 감정 변화 화면에서 한다.
    expect(apiClient.put).not.toHaveBeenCalled()
  })

  it('넘어가는 중에는 버튼이 비활성화되어 두 번 넘기지 않는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draftResponse })
    const { onSave } = renderView()

    const save = await screen.findByRole('button', { name: '사건파일 저장하기' })
    fireEvent.click(save)
    const busy = screen.getByRole('button', { name: '저장하는 중…' })
    expect(busy).toBeDisabled()
    fireEvent.click(busy)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('수정된 생각을 비우면 저장하지 않고 오류를 보여준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: draftResponse })
    renderView()

    fireEvent.click(await screen.findByRole('button', { name: '수정된 생각 직접 수정' }))
    fireEvent.change(screen.getByRole('textbox', { name: '수정된 생각 직접 수정' }), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '사건파일 저장하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('수정된 생각을 입력해 주세요.')
    expect(apiClient.put).not.toHaveBeenCalled()
  })
})
