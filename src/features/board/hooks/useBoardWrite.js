import { useState } from 'react'
import { VISIBILITY } from '@/constants/visibility'
import { submitMockBoardPost } from '../mocks/boardWriteMocks'

/** 글쓰기 입력과 목업 제출을 관리한다. API 연결 시 제출 함수만 교체한다. */
export const useBoardWrite = ({ onOpenPrivate, onClosePrivate } = {}) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('')
  const [isPrivateOpen, setPrivateOpen] = useState(false)
  const canSubmit = Boolean(title.trim() && body.trim() && visibility)

  /** 비공개 선택 시 비밀번호 설정 패널을 연다. */
  const selectVisibility = (value) => {
    setVisibility(value)
    if (value === VISIBILITY.passwordProtected) {
      if (onOpenPrivate) onOpenPrivate()
      else setPrivateOpen(true)
    }
  }

  /** 입력한 비밀번호는 요청에만 전달하며 저장소나 전역 상태에 남기지 않는다. */
  const submitPrivate = (password) => {
    if (!title.trim() || !body.trim()) return
    // TODO(API 확인 필요): 캡처 4자, 기존 공유 6자, API 8~64자의 규칙을 확정한다.
    submitMockBoardPost({
      title: title.trim(),
      body: body.trim(),
      visibility: VISIBILITY.passwordProtected,
      password,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    if (visibility === VISIBILITY.passwordProtected) {
      if (onOpenPrivate) onOpenPrivate()
      else setPrivateOpen(true)
      return
    }
    // TODO(API 확인 필요): 사건 ID 연결 및 게시 전 미리보기.
    submitMockBoardPost({ title: title.trim(), body: body.trim(), visibility })
  }

  return {
    title,
    setTitle,
    body,
    setBody,
    visibility,
    setVisibility: selectVisibility,
    canSubmit,
    handleSubmit,
    isPrivateOpen,
    closePrivate: () => {
      if (onClosePrivate) onClosePrivate()
      else setPrivateOpen(false)
    },
    submitPrivate,
  }
}
