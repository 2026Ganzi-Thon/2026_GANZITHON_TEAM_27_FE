import { useState } from 'react'
import { submitMockBoardPost } from '../mocks/boardWriteMocks'

/** 글쓰기 입력과 목업 제출을 관리한다. API 연결 시 제출 함수만 교체한다. */
export const useBoardWrite = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('')
  const canSubmit = Boolean(title.trim() && body.trim() && visibility)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    // TODO(API 확인 필요): 사건 ID 연결, 비밀번호 보호 입력 및 게시 전 미리보기.
    submitMockBoardPost({ title: title.trim(), body: body.trim(), visibility })
  }

  return { title, setTitle, body, setBody, visibility, setVisibility, canSubmit, handleSubmit }
}
