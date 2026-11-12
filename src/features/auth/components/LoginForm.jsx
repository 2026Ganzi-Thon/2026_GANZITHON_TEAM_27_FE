import { AuthField } from './AuthField'
import { AuthSwitchLink } from './AuthSwitchLink'

/**
 * 로그인 폼. 아이디·비밀번호 입력과 로그인 버튼, 회원가입 이동 링크를 보여준다.
 * @param {object} props
 * @param {string} props.signupTo 회원가입 화면 주소(라우트 상수는 pages에서 넘긴다)
 * @param {(values: {username: string, password: string}) => void} [props.onSubmit] 로그인 제출 핸들러
 * @param {boolean} [props.isPending] true면 요청 중이라 버튼을 막고 "로그인 중…"을 보여준다
 * @param {string} [props.errorMessage] 로그인 실패 문구. 비밀번호 칸 아래에 보여준다
 */
export const LoginForm = ({ signupTo, onSubmit, isPending = false, errorMessage }) => {
  /** 폼 제출을 받아 입력값을 onSubmit으로 넘긴다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    // TODO(API 확인 필요): 로그인 API가 확정되면 요청과 오류 상태를 연결한다.
    onSubmit?.({
      username: String(formData.get('username') ?? ''),
      password: String(formData.get('password') ?? ''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="mt-34 flex flex-col gap-2.25">
        <AuthField
          muted
          label="아이디"
          name="username"
          type="text"
          placeholder="아이디를 입력하세요"
          autoComplete="username"
        />
        <AuthField
          muted
          label="비밀번호"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          error={errorMessage}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-5.25 pb-11.5">
        <button
          type="submit"
          disabled={isPending}
          className="h-button w-full rounded-full bg-ink text-base font-semibold text-field disabled:opacity-60"
        >
          {isPending ? '로그인 중…' : '로그인'}
        </button>
        <AuthSwitchLink question="계정이 없으신가요?" to={signupTo} label="회원가입" />
      </div>
    </form>
  )
}
