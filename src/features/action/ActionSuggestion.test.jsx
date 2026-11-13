import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { ActionSuggestionView } from './index'
import { ACTION_TEXT_MAX_LENGTH, buildFollowUpBody, isSupportRequired } from './utils'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const renderView = () => {
  const handlers = { onBack: vi.fn(), onDone: vi.fn(), onSupportRequired: vi.fn() }
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ActionSuggestionView caseId="case-1" homeTo="/" {...handlers} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return handlers
}

const radios = () => screen.getAllByRole('radio')

describe('행동 제안 화면', () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockReset().mockResolvedValue({ data: {} })
  })

  it('Figma 문구를 그대로 보여준다', () => {
    renderView()
    expect(screen.getByRole('heading', { name: 'YOUR NEXTMOVE.' })).toBeInTheDocument()
    for (const text of [
      '작은 행동 하나로 오늘을 마무리해 보세요.',
      'RECOMMENDED FOR YOU ★',
      'TAKE A WALK!',
      '5분만 가볍게 걸어보기',
      '02/MUSIC',
      '좋아하는 음악 듣기',
      '5 MIN',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByRole('group', { name: 'CHOOSE YOUR ACTION' })).toBeInTheDocument()
    expect(screen.getAllByText('01/ WALK')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'LET’S DO IT' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '오늘은 쉬기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
  })

  it('카드는 한 묶음의 라디오 버튼이고, 처음엔 카드 2("02/MUSIC")가 선택되어 있다', () => {
    renderView()
    expect(radios()).toHaveLength(4)
    expect(new Set(radios().map((radio) => radio.name)).size).toBe(1)
    expect(screen.getByRole('radio', { name: '02/MUSIC, 좋아하는 음악 듣기, 5 MIN' })).toBeChecked()
    expect(radios().filter((radio) => radio.checked)).toHaveLength(1)
  })

  it('다른 카드를 고르면 그 카드만 선택된다', () => {
    renderView()
    fireEvent.click(radios()[0])
    expect(radios()[0]).toBeChecked()
    expect(screen.getByRole('radio', { name: /02\/MUSIC/ })).not.toBeChecked()
    expect(radios().filter((radio) => radio.checked)).toHaveLength(1)
  })

  it('"LET’S DO IT"은 고른 카드의 설명을 action_text로 보내고 다음 화면으로 넘긴다', async () => {
    const { onDone } = renderView()
    fireEvent.click(radios()[0])
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    await waitFor(() => expect(onDone).toHaveBeenCalledWith('action'))
    expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/follow-up', {
      choice: 'action',
      action_text: '5분 산책하기',
    })
  })

  it('"오늘은 쉬기"는 choice rest만 보낸다', async () => {
    const { onDone } = renderView()
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))

    await waitFor(() => expect(onDone).toHaveBeenCalledWith('rest'))
    expect(apiClient.put).toHaveBeenCalledWith('/cases/case-1/follow-up', { choice: 'rest' })
  })

  it('저장하는 동안과 저장 뒤 다음 화면으로 넘어가는 동안에는 버튼과 카드를 누를 수 없다', async () => {
    let resolve
    vi.mocked(apiClient.put).mockReturnValue(new Promise((r) => (resolve = r)))
    const { onDone } = renderView()
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'LET’S DO IT' })).toBeDisabled())
    expect(screen.getByRole('button', { name: '오늘은 쉬기' })).toBeDisabled()
    radios().forEach((radio) => expect(radio).toBeDisabled())
    resolve({ data: {} })
    await waitFor(() => expect(onDone).toHaveBeenCalledWith('rest'))
    // 다음 화면이 열릴 때까지 다시 누를 수 없다.
    expect(screen.getByRole('button', { name: '오늘은 쉬기' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '오늘은 쉬기' }))
    expect(apiClient.put).toHaveBeenCalledTimes(1)
  })

  it('응답이 support_required면 다음 화면 대신 위기 안내로 넘긴다', async () => {
    const support = { outcome: 'support_required', support: { message: '...', contacts: [] } }
    vi.mocked(apiClient.put).mockResolvedValue({ data: support })
    const { onDone, onSupportRequired } = renderView()
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    await waitFor(() => expect(onSupportRequired).toHaveBeenCalled())
    expect(onDone).not.toHaveBeenCalled()
  })

  it('저장에 실패하면 오류를 알리고 고른 카드는 그대로 둔다', async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new Error('network'))
    const { onDone } = renderView()
    fireEvent.click(radios()[3])
    fireEvent.click(screen.getByRole('button', { name: 'LET’S DO IT' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    expect(radios()[3]).toBeChecked()
  })

  it('뒤로 가기를 누르면 onBack을 부른다', () => {
    const { onBack } = renderView()
    fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }))
    expect(onBack).toHaveBeenCalled()
  })
})

describe('follow-up 요청 본문', () => {
  it('rest는 choice만 보낸다', () => {
    expect(buildFollowUpBody('rest', '무시되는 글')).toEqual({ choice: 'rest' })
  })

  it('action은 앞뒤 공백을 지운 action_text를 함께 보낸다', () => {
    expect(buildFollowUpBody('action', '  5분 산책하기 ')).toEqual({
      choice: 'action',
      action_text: '5분 산책하기',
    })
  })

  it('action_text가 비었거나 500자를 넘으면 오류를 던진다', () => {
    expect(() => buildFollowUpBody('action', '   ')).toThrow(RangeError)
    expect(() => buildFollowUpBody('action', 'a'.repeat(ACTION_TEXT_MAX_LENGTH + 1))).toThrow(
      RangeError,
    )
    expect(
      buildFollowUpBody('action', 'a'.repeat(ACTION_TEXT_MAX_LENGTH)).action_text,
    ).toHaveLength(ACTION_TEXT_MAX_LENGTH)
  })

  it('support_required 응답을 알아본다', () => {
    expect(isSupportRequired({ outcome: 'support_required' })).toBe(true)
    expect(isSupportRequired({})).toBe(false)
    expect(isSupportRequired(undefined)).toBe(false)
  })
})
