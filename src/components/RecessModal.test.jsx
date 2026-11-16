import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { RecessModal } from './RecessModal'

/** 실제 화면처럼: main(스크롤 영역) 안에 뒤로가기 버튼과 모달을 둔다. */
const Harness = ({ onConfirm = vi.fn(), onCancelSpy = vi.fn() }) => {
  const [open, setOpen] = useState(false)
  return (
    <main style={{ overflow: 'auto' }} data-testid="scroller">
      <button type="button" onClick={() => setOpen(true)}>
        뒤로 가기
      </button>
      <RecessModal
        open={open}
        onConfirm={onConfirm}
        onCancel={() => {
          onCancelSpy()
          setOpen(false)
        }}
      />
    </main>
  )
}

const openModal = (props) => {
  render(<Harness {...props} />)
  const opener = screen.getByRole('button', { name: '뒤로 가기' })
  opener.focus()
  fireEvent.click(opener)
  return { opener, dialog: screen.getByRole('dialog') }
}

describe('RecessModal', () => {
  it('닫혀 있으면 아무것도 그리지 않는다', () => {
    render(<RecessModal open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('열리면 Figma 문구와 접근성 속성(aria-modal, 제목·안내 연결)을 가진다', () => {
    const { dialog } = openModal()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('지금은 잠시 휴정할까요?')
    expect(dialog).toHaveAccessibleDescription(
      /오늘의 재판을 멈추고\s+나중에 다시 시작할 수 있어요\./,
    )
    expect(screen.getByRole('button', { name: '휴정하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument()
  })

  it.each([
    ['X', () => fireEvent.click(screen.getByRole('button', { name: '닫기' }))],
    ['취소', () => fireEvent.click(screen.getByRole('button', { name: '취소' }))],
    ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['바깥 클릭', () => fireEvent.click(screen.getByRole('dialog').parentElement)],
  ])('%s로 닫히고 원래 버튼으로 포커스가 돌아온다', (_, close) => {
    const onCancelSpy = vi.fn()
    const { opener } = openModal({ onCancelSpy })
    close()
    expect(onCancelSpy).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('모달 안을 클릭해도 닫히지 않는다', () => {
    const onCancelSpy = vi.fn()
    openModal({ onCancelSpy })
    fireEvent.click(screen.getByRole('heading', { name: '지금은 잠시 휴정할까요?' }))
    expect(onCancelSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('휴정하기는 onConfirm만 부르고 닫기는 부르지 않는다', () => {
    const onConfirm = vi.fn()
    const onCancelSpy = vi.fn()
    openModal({ onConfirm, onCancelSpy })
    fireEvent.click(screen.getByRole('button', { name: '휴정하기' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancelSpy).not.toHaveBeenCalled()
  })

  it('열리면 포커스가 모달 안(취소)으로 들어가고, Tab은 모달 밖으로 나가지 않는다', () => {
    openModal()
    const close = screen.getByRole('button', { name: '닫기' })
    const confirm = screen.getByRole('button', { name: '휴정하기' })
    const cancel = screen.getByRole('button', { name: '취소' })
    expect(cancel).toHaveFocus()

    // 마지막(취소)에서 Tab → 처음(닫기)
    fireEvent.keyDown(cancel, { key: 'Tab' })
    expect(close).toHaveFocus()
    // 처음(닫기)에서 Shift+Tab → 마지막(취소)
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(cancel).toHaveFocus()
    // 중간에서는 브라우저 기본 이동에 맡긴다
    confirm.focus()
    fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(confirm).toHaveFocus()
  })

  it('열려 있는 동안 스크롤 영역(main)의 스크롤을 막고, 닫히면 되돌린다', () => {
    const { opener } = openModal()
    const scroller = screen.getByTestId('scroller')
    expect(scroller.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(scroller.style.overflow).toBe('auto')
    expect(opener).toHaveFocus()
  })

  it('휴정 처리 중이면 휴정하기 버튼을 비활성화한다', () => {
    render(<RecessModal open onConfirm={vi.fn()} onCancel={vi.fn()} isConfirming />)
    expect(screen.getByRole('button', { name: '휴정하기' })).toBeDisabled()
  })
})
