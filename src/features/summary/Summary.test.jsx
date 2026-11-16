import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { SummaryView } from './index'

// 동료의 사건 조회(useCase)가 목업 저장소에서 300ms 기다린다.
configure({ asyncUtilTimeout: 5000 })

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const LONG_THOUGHT =
  '회의에서 발표를 망쳐서 다들 나를 한심하게 봤을 것 같고 앞으로도 계속 이럴 것 같아서 나는 쓸모없는 사람 같다'

/** 사건 접수 화면이 목업 저장소(localStorage `mock-case-files`)에 저장한 모양 그대로 넣는다. */
const seedIntake = (overrides = {}) =>
  localStorage.setItem(
    'mock-case-files',
    JSON.stringify([
      {
        id: 'case-1',
        case_number: '2026-000007',
        title: null,
        thought: LONG_THOUGHT,
        emotion: { type: 'anxiety', intensity: 80 },
        emotion_after: null,
        status: 'received',
        created_at: '2026-11-13T00:00:00.000Z',
        ...overrides,
      },
    ]),
  )

/** 법정 진행 결과(`GET /cases/{caseId}` 응답 중 사건요약이 읽는 부분) */
const result = {
  pattern_tags: ['labeling', 'all_or_nothing'],
  decision: { type: 'reframed', final_statement: '내가 고친 문장이다.' },
  emotion_after: { type: 'anxiety', intensity: 30 },
}

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => Object.assign(new Error('request failed'), { response: { status } })

const renderView = (props = {}) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <SummaryView caseId="case-1" confirmTo="/" makeCardTo="/card" {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('SummaryView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(apiClient.get).mockReset()
  })

  it('불러오는 동안 로딩 상태를 보여준다', () => {
    seedIntake()
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}))
    renderView()
    expect(screen.getByRole('heading', { name: '사건파일 요약' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('불러오고 있어요')
  })

  it('네 칸이 접수 글·확정한 진술문·대표 패턴 1개·접수 강도와 종결 강도로 채워진다', async () => {
    seedIntake()
    vi.mocked(apiClient.get).mockResolvedValue({ data: result })
    renderView()

    expect(await screen.findByText('사건번호 #2026-000007')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledWith('/cases/case-1')
    // 처음 든 생각: 접수 글 한 줄(넘치면 말줄임)
    const thought = screen.getByText(LONG_THOUGHT)
    expect(thought).toHaveClass('truncate')
    // 최종판결: 판결 화면에서 확정한(직접 고친) 문장
    expect(screen.getByText('내가 고친 문장이다.')).toBeInTheDocument()
    // 사건 유형: 첫 번째 패턴 하나만 이름으로
    expect(screen.getByText('낙인 찍기')).toBeInTheDocument()
    expect(screen.queryByText(/흑백 논리/)).not.toBeInTheDocument()
    // 감정 변화: 접수 80 → 감정 변화 화면 30
    expect(screen.getByText('재판을 통해, 불안이 50% 줄어들었어요.')).toBeInTheDocument()
    expect(screen.getByText('재판 전 불안 80%, 재판 후 30%')).toBeInTheDocument()
  })

  it.each([
    ['접수 때 감정이 없으면', { emotion: null }, result],
    [
      '접수·종결 감정 종류가 다르면',
      {},
      { ...result, emotion_after: { type: 'anger', intensity: 30 } },
    ],
    ['종결 감정이 없으면', {}, { ...result, emotion_after: null }],
  ])('%s 그래프 대신 비교할 수 없다는 문구를 보여준다', async (_, intakeOverrides, data) => {
    seedIntake(intakeOverrides)
    vi.mocked(apiClient.get).mockResolvedValue({ data })
    renderView()
    expect(await screen.findByText('재판 전과 후의 감정을 비교할 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByText(/재판 전 /)).not.toBeInTheDocument()
  })

  it('판단 보류로 진술문 없이 확정했으면 보류 문구, 패턴이 없으면 없음 문구를 보여준다', async () => {
    seedIntake()
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { ...result, pattern_tags: [], decision: { type: 'deferred', final_statement: null } },
    })
    renderView()
    expect(await screen.findByText('판단을 보류했어요.')).toBeInTheDocument()
    expect(screen.getByText('찾은 사고 패턴이 없어요.')).toBeInTheDocument()
  })

  it('예시 사건(sample)은 접수 정보를 동료의 예시 사건에서 읽고(감정 변화·사건 카드와 같은 70), 판결 결과는 예시 값을 쓴다', async () => {
    renderView({ caseId: 'sample' })
    // 접수 정보: 동료의 예시 사건(useCase('sample'))
    expect(await screen.findByText('사건번호 #2026-000031')).toBeInTheDocument()
    expect(screen.getByText('나는 쓸모없어.')).toBeInTheDocument()
    // 법정 진행 결과: 예시 값(재판 후 40, 최종판결 Figma 문구)
    expect(screen.getByText('그럴 수 있다.')).toBeInTheDocument()
    expect(screen.getByText('흑백 논리')).toBeInTheDocument()
    expect(screen.getByText('재판을 통해, 불안이 30% 줄어들었어요.')).toBeInTheDocument()
    expect(screen.getByText('재판 전 불안 70%, 재판 후 40%')).toBeInTheDocument()
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('판결 결과를 불러오지 못하면 다시 시도할 수 있다', async () => {
    seedIntake()
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({ data: result })
    renderView()
    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('사건번호 #2026-000007')).toBeInTheDocument()
  })

  it('사건 접수 기록이 없거나 서버가 404면 다시 시도 없이 찾을 수 없다고 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: result })
    renderView()
    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('서버가 404면 찾을 수 없다고 보여준다', async () => {
    seedIntake()
    vi.mocked(apiClient.get).mockRejectedValue(httpError(404))
    renderView()
    expect(await screen.findByText('사건을 찾을 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('확인·사건카드 만들기는 링크, 뒤로가기는 버튼이고 공유는 동작이 없으면 비활성이다', async () => {
    seedIntake()
    vi.mocked(apiClient.get).mockResolvedValue({ data: result })
    renderView()
    await screen.findByText('사건번호 #2026-000007')

    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '사건카드 만들기' })).toHaveAttribute('href', '/card')
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '공유하기' })).toBeDisabled()
  })

  it('공유 핸들러가 있으면 공유 버튼을 누를 수 있다', () => {
    seedIntake()
    vi.mocked(apiClient.get).mockResolvedValue({ data: result })
    const onShare = vi.fn()
    renderView({ onShare })
    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))
    expect(onShare).toHaveBeenCalled()
  })
})
