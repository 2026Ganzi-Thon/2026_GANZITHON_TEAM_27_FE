import { useState } from 'react'
import { BigButton } from '@/components/BigButton'
import { VISIBILITY } from '@/constants/visibility'
import { canPost, validatePostPassword } from '../utils'
import { PasswordField } from './PasswordField'
import { VisibilityPicker } from './VisibilityPicker'

/**
 * 게시판 공유 폼. 공개 범위를 고르고, 비공개이면 비밀번호를 정한 뒤 "게시하기"를 누른다.
 *
 * - 처음에는 아무 공개 범위도 선택되어 있지 않고, 고르기 전에는 "게시하기"를 누를 수 없다.
 * - 비공개를 고르면 비밀번호 입력칸이 나타난다. 비밀번호는 이 컴포넌트 안에서만 다룬다(URL·캐시·전역 상태에 두지 않는다).
 * - 게시에 실패해도 입력한 내용은 지우지 않는다.
 *
 * @param {{
 *   onSubmit: (values: { visibility: string, password?: string }) => void,
 *   isPending?: boolean,
 *   isError?: boolean,
 * }} props
 * - `onSubmit`: 게시할 수 있는 상태에서 "게시하기"를 누르면 공개 범위와 (비공개일 때만) 비밀번호와 함께 호출한다
 * - `isPending`: 게시를 요청하는 중인지
 * - `isError`: 게시에 실패했는지
 */
export const ShareForm = ({ onSubmit, isPending = false, isError = false }) => {
  const [visibility, setVisibility] = useState(null)
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  const isPrivate = visibility === VISIBILITY.passwordProtected
  const passwordError = isPrivate && passwordTouched ? validatePostPassword(password) : ''
  const postable = canPost(visibility, password) && !isPending

  /** 비공개 글은 비밀번호 칸을 한 번이라도 만진 뒤부터 오류를 보여준다. */
  const handlePasswordChange = (value) => {
    setPassword(value)
    setPasswordTouched(true)
  }

  /** 게시한다. 비공개가 아닐 때는 비밀번호를 보내지 않는다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    if (!postable) return
    onSubmit({ visibility, password: isPrivate ? password : undefined })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col pb-9.5">
      <div className="mt-10">
        <VisibilityPicker value={visibility} onChange={setVisibility} />
      </div>

      {isPrivate && (
        <div className="mt-8.5">
          <PasswordField value={password} onChange={handlePasswordChange} error={passwordError} />
        </div>
      )}

      {isError && (
        <p role="alert" className="mx-4.5 mt-6 text-sm text-danger">
          게시하지 못했어요. 선택한 내용은 그대로 있으니 다시 눌러 주세요.
        </p>
      )}

      <div className="mt-auto px-4.5 pt-8">
        <BigButton type="submit" disabled={!postable}>
          {isPending ? '게시 중…' : '게시하기'}
        </BigButton>
      </div>
    </form>
  )
}
