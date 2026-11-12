import { useNavigate } from 'react-router-dom'
import { SignupForm, SignupHeader } from '@/features/auth'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 회원가입 화면 입구. auth feature의 헤더와 폼을 조합하고, 가입을 마치면 로그인 화면으로 이동한다.
 */
const SignupPage = () => {
  const navigate = useNavigate()

  // TODO(API 확인 필요): 회원가입 API가 확정되면 요청이 성공한 뒤에 이동하도록 바꾼다.
  /** 계정 만들기를 마치면 로그인 화면으로 이동한다. */
  const handleSubmit = () => navigate(ROUTE_PATHS.login)

  return (
    <section className="flex flex-1 flex-col bg-canvas px-4">
      <SignupHeader />
      <SignupForm loginTo={ROUTE_PATHS.login} onSubmit={handleSubmit} />
    </section>
  )
}

export default SignupPage
