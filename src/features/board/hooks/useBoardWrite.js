import { useState } from 'react'
import { VISIBILITY } from '@/constants/visibility'
import { createBoardPost } from '../api/board'
import { validateBoardPassword } from '../utils'

/** 등록 실패 안내 문구 */
const SUBMIT_ERROR_MESSAGE = '등록하지 못했어요. 작성한 내용은 그대로 있으니 다시 눌러 주세요.'

/**
 * 글쓰기 입력과 등록 요청(`POST /board/posts`)을 관리한다.
 *
 * 비밀번호가 요청에 들어가므로 TanStack Query mutation(캐시에 남는다)을 쓰지 않고 이 hook 안의 상태로만
 * 진행 상태를 다룬다. 비밀번호는 비공개 설정 패널과 요청 본문에만 있고 저장소·전역 상태에 남기지 않는다.
 *
 * @param {{
 *   onOpenPrivate?: () => void,
 *   onClosePrivate?: () => void,
 *   onSubmitted?: (result: object) => void,
 *   onSupportRequired?: () => void,
 * }} [options]
 * - `onSubmitted`: 등록에 성공하면 서버 응답과 함께 호출한다
 * - `onSupportRequired`: 응답이 위기 안내(`support_required`)면 호출한다(응답 내용은 넘기지 않는다)
 */
export const useBoardWrite = ({
  onOpenPrivate,
  onClosePrivate,
  onSubmitted,
  onSupportRequired,
} = {}) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('')
  const [isPrivateOpen, setPrivateOpen] = useState(false)
  const [isPending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const canSubmit = Boolean(title.trim() && body.trim() && visibility) && !isPending

  /** 비공개 선택 시 비밀번호 설정 패널을 연다. */
  const selectVisibility = (value) => {
    setVisibility(value)
    if (value === VISIBILITY.passwordProtected) {
      if (onOpenPrivate) onOpenPrivate()
      else setPrivateOpen(true)
    }
  }

  /** 등록 요청을 보내고 결과에 따라 콜백을 부른다. 실패해도 입력은 지우지 않는다. */
  const submit = async (values) => {
    if (isPending) return
    setPending(true)
    setErrorMessage(null)
    try {
      const result = await createBoardPost(values)
      setPending(false)
      if (result?.outcome === 'support_required') onSupportRequired?.()
      else onSubmitted?.(result)
    } catch {
      setPending(false)
      setErrorMessage(SUBMIT_ERROR_MESSAGE)
    }
  }

  /** 입력한 비밀번호는 요청에만 전달하며 저장소나 전역 상태에 남기지 않는다. */
  const submitPrivate = (password) => {
    if (!title.trim() || !body.trim()) return
    const passwordError = validateBoardPassword(password)
    if (passwordError) {
      setErrorMessage(passwordError)
      return
    }
    submit({
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
    submit({ title: title.trim(), body: body.trim(), visibility })
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
    isPending,
    errorMessage,
    isPrivateOpen,
    closePrivate: () => {
      setErrorMessage(null)
      if (onClosePrivate) onClosePrivate()
      else setPrivateOpen(false)
    },
    submitPrivate,
  }
}
