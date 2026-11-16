import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { BoardWriteView } from './components/BoardWriteView'
import { submitMockBoardPost } from './mocks/boardWriteMocks'

vi.mock('./mocks/boardWriteMocks', () => ({ submitMockBoardPost: vi.fn() }))

it('입력과 공개 선택 후 목업 요청을 제출하고 작성 내용을 유지한다', () => {
  const onBack = vi.fn()
  render(<BoardWriteView onBack={onBack} />)
  const submit = screen.getByRole('button', { name: '등록하기' })
  expect(submit).toBeDisabled()
  expect(screen.queryByRole('button', { name: '게시글 공유' })).not.toBeInTheDocument()

  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), {
    target: { value: '  오늘의 생각  ' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), {
    target: { value: '기록할 내용' },
  })
  expect(submit).toBeDisabled()
  fireEvent.click(screen.getByRole('radio', { name: '공개', exact: true }))
  expect(submit).toBeEnabled()
  fireEvent.click(submit)
  expect(submitMockBoardPost).toHaveBeenCalledWith({
    title: '오늘의 생각',
    body: '기록할 내용',
    visibility: 'public',
  })
  expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue('  오늘의 생각  ')

  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  expect(screen.getByRole('radio', { name: '공개', exact: true })).not.toBeChecked()
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '   ' } })
  expect(submit).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }))
  expect(onBack).toHaveBeenCalledOnce()
})
