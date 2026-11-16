import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EmotionChangeView } from './index'

/** 접수 당시 감정 상태(intake)를 받아 화면을 그린다. 사건 조회는 페이지가 한다. */
const renderView = (intake) => {
  const onNext = vi.fn()
  render(
    <MemoryRouter>
      <EmotionChangeView intake={intake} onNext={onNext} />
    </MemoryRouter>,
  )
  return { onNext }
}

const ready = (emotion) => ({ status: 'ready', emotion })

describe('EmotionChangeView', () => {
  it('Figma 문구와 슬라이더 초기값 40, 접수 당시 강도를 보여준다', () => {
    renderView(ready({ type: 'anxiety', intensity: 35 }))

    expect(screen.getByRole('heading', { name: '감정 확인' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'EMOTION CHECK' })).toBeInTheDocument()
    expect(screen.getByText('지금 감정 상태를 체크해주세요.')).toBeInTheDocument()
    // 슬라이더는 접수 값과 상관없이 Figma 초기값 40에서 시작한다.
    expect(screen.getByRole('slider', { name: '지금 감정의 강도' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(screen.getByText('접수 당시: 35')).toBeInTheDocument()
  })

  it('접수 때 감정을 입력하지 않았으면 기록 없음으로 보여준다', () => {
    renderView(ready(null))
    expect(screen.getByText('접수 당시: 기록 없음')).toBeInTheDocument()
  })

  it('불러오는 중이면 상태를 알린다', () => {
    renderView({ status: 'loading' })
    expect(screen.getByRole('status')).toHaveTextContent('접수 당시: …')
  })

  it('접수 당시 감정을 불러오지 못하면 다시 시도할 수 있다', () => {
    const onRetry = vi.fn()
    renderView({ status: 'error', onRetry })
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('다음을 누르면 접수 때 감정 type과 지금 강도를 넘긴다', () => {
    const { onNext } = renderView(ready({ type: 'shame', intensity: 35 }))
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(onNext).toHaveBeenCalledWith({ type: 'shame', intensity: 100 })
  })

  it('접수 때 감정이 없으면 type 없이 넘긴다(판결 확정 때 emotion_after를 보내지 않는다)', () => {
    const { onNext } = renderView(ready(null))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(onNext).toHaveBeenCalledWith({ type: null, intensity: 40 })
  })
})
