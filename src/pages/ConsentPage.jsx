import { useNavigate } from 'react-router-dom'
import { ConsentForm, ConsentHeader } from '@/features/consent'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 동의 화면 입구. consent feature를 조합하고, 동의를 마치면 회원가입 화면으로 이동한다.
 */
const ConsentPage = () => {
  const navigate = useNavigate()

  // TODO(피그마 확인 필요): 동의 다음 화면이 회원가입이 맞는지 `화면 이동` 페이지로 확인한다.
  /** 동의를 마치면 회원가입 화면으로 이동한다. */
  const handleNext = () => navigate(ROUTE_PATHS.signup)

  return (
    <section className="flex flex-1 flex-col bg-canvas px-4">
      <ConsentHeader />
      <ConsentForm onNext={handleNext} />
    </section>
  )
}

export default ConsentPage
