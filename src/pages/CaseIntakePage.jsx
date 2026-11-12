import { useNavigate } from 'react-router-dom'
import { IntakeForm, IntakeHeader } from '@/features/case'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건 접수 화면 입구. 헤더와 접수 폼을 조합하고, 사건파일이 만들어지면 홈으로 이동한다.
 * TODO(피그마 확인 필요): 기소 준비 화면(2-1)이 만들어지면 접수 후 그 화면으로 이동한다.
 */
const CaseIntakePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col bg-canvas pt-16.25">
      <IntakeHeader homeTo={ROUTE_PATHS.home} onBack={() => navigate(-1)} />
      <IntakeForm onCreated={() => navigate(ROUTE_PATHS.home)} />
    </section>
  )
}

export default CaseIntakePage
