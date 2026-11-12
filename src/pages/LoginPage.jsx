import { useNavigate } from 'react-router-dom'
import { LoginForm, LoginHeader, useLogin } from '@/features/auth'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 로그인 화면 입구. auth feature의 헤더와 폼을 조합하고, 로그인에 성공하면 홈으로 이동한다.
 */
const LoginPage = () => {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useLogin()

  /** 로그인 요청을 보내고, 성공하면 홈으로 이동한다. */
  const handleSubmit = (values) => {
    mutate(values, { onSuccess: () => navigate(ROUTE_PATHS.home) })
  }

  return (
    <section className="flex flex-1 flex-col bg-canvas px-4">
      <LoginHeader />
      <LoginForm
        signupTo={ROUTE_PATHS.consent}
        onSubmit={handleSubmit}
        isPending={isPending}
        errorMessage={error?.message}
      />
    </section>
  )
}

export default LoginPage
