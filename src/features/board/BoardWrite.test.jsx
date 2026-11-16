import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { createBoardPost } from './api/board'
import { BoardWriteView } from './components/BoardWriteView'

vi.mock('./api/board', () => ({ createBoardPost: vi.fn() }))

beforeEach(() => {
  vi.mocked(createBoardPost)
    .mockReset()
    .mockResolvedValue({ id: 'post-1', status: 'pending_review', visibility: 'public' })
})

it('입력과 공개 선택 후 POST /board/posts로 등록하고, 성공하면 onSubmitted를 부르며 작성 내용을 유지한다', async () => {
  const onBack = vi.fn()
  const onSubmitted = vi.fn()
  render(<BoardWriteView onBack={onBack} onSubmitted={onSubmitted} />)
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
  expect(createBoardPost).toHaveBeenCalledWith({
    title: '오늘의 생각',
    body: '기록할 내용',
    visibility: 'public',
  })
  await waitFor(() =>
    expect(onSubmitted).toHaveBeenCalledWith(expect.objectContaining({ id: 'post-1' })),
  )
  expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue('  오늘의 생각  ')

  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(screen.getByRole('radio', { name: '공개', exact: true })).not.toBeChecked()
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '   ' } })
  expect(submit).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }))
  expect(onBack).toHaveBeenCalledOnce()
})

it('비공개 패널에서 비밀번호를 등록 요청으로 전달하고 닫으면 입력을 지운다', async () => {
  render(<BoardWriteView />)
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '제목' } })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), { target: { value: '본문' } })
  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  expect(screen.getByRole('dialog', { name: '비공개 설정' })).toHaveFocus()
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '  password  ' } })
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))
  expect(createBoardPost).toHaveBeenCalledWith({
    title: '제목',
    body: '본문',
    visibility: 'password_protected',
    password: '  password  ',
  })
  await waitFor(() => expect(screen.getByRole('button', { name: '등록하기' })).toBeEnabled())
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue('제목')
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))
  expect(screen.getByLabelText('비밀번호')).toHaveValue('')
})

it('비밀번호가 6자보다 짧으면 요청하지 않고 안내한다', () => {
  render(<BoardWriteView />)
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '제목' } })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), { target: { value: '본문' } })
  fireEvent.click(screen.getByRole('radio', { name: '비공개' }))
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '1234' } })
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))

  expect(createBoardPost).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toHaveTextContent('비밀번호는 6자 이상이어야 해요.')
})

it('위기 안내(support_required) 응답이면 onSupportRequired를 부른다', async () => {
  vi.mocked(createBoardPost).mockResolvedValue({ outcome: 'support_required', support: {} })
  const onSubmitted = vi.fn()
  const onSupportRequired = vi.fn()
  render(<BoardWriteView onSubmitted={onSubmitted} onSupportRequired={onSupportRequired} />)
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '제목' } })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), { target: { value: '본문' } })
  fireEvent.click(screen.getByRole('radio', { name: '공개', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))

  await waitFor(() => expect(onSupportRequired).toHaveBeenCalledOnce())
  expect(onSubmitted).not.toHaveBeenCalled()
})

it('등록에 실패하면 작성 내용을 유지하고 오류를 보여준다', async () => {
  vi.mocked(createBoardPost).mockRejectedValue(new Error('network'))
  render(<BoardWriteView />)
  fireEvent.change(screen.getByRole('textbox', { name: '제목' }), { target: { value: '제목' } })
  fireEvent.change(screen.getByRole('textbox', { name: '본문' }), { target: { value: '본문' } })
  fireEvent.click(screen.getByRole('radio', { name: '공개', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('등록하지 못했어요')
  expect(screen.getByRole('textbox', { name: '제목' })).toHaveValue('제목')
})
