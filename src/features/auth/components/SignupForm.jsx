import { useState } from 'react'
import { validateSignup } from '../utils'
import { AuthField } from './AuthField'
import { AuthSwitchLink } from './AuthSwitchLink'

/**
 * 회원가입 폼. 아이디·비밀번호·비밀번호 확인을 입력받고 비밀번호 조건과 일치 여부를 검사한다.
 * @param {object} props
 * @param {string} props.loginTo 로그인 화면 주소(라우트 상수는 pages에서 넘긴다)
 * @param {(values: {username: string, password: string}) => void} [props.onSubmit] 검사를 통과한 입력값을 받는 핸들러
 */
export const SignupForm = ({ loginTo, onSubmit }) => {
  const [errors, setErrors] = useState({})

  /** 입력값을 검사하고, 통과하면 onSubmit으로 넘긴다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '')

    const nextErrors = validateSignup({ password, passwordConfirm })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // TODO(API 확인 필요): 회원가입 API가 확정되면 요청과 다음 화면(동의) 이동을 연결한다.
    onSubmit?.({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
      <div className="mt-23.75 flex flex-col gap-1.75">
        <AuthField
          label="아이디"
          name="username"
          type="username"
          placeholder="아이디를 입력하세요"
          autoComplete="username"
        />
        <AuthField
          label="비밀번호"
          name="password"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 6자 이상"
          autoComplete="new-password"
          error={errors.password}
        />
        <AuthField
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요."
          autoComplete="new-password"
          error={errors.passwordConfirm}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-3.75 pb-11.5">
        <button
          type="submit"
          className="h-button w-full rounded-full bg-ink text-base font-semibold text-field"
        >
          다음
        </button>
        <AuthSwitchLink question="이미 계정이 있으신가요?" to={loginTo} label="로그인" />
      </div>
    </form>
  )
}
