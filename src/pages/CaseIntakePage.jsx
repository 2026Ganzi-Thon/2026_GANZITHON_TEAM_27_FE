import { useNavigate } from 'react-router-dom'
import { BackHomeHeader } from '@/components/BackHomeHeader'
import { IntakeForm } from '@/features/case'
import { getProsecutionPath, ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건 접수 화면 입구. 헤더와 접수 폼을 조합하고, 사건파일이 만들어지면 그 사건의 기소 화면으로 이동한다.
 * 기소 화면에서 뒤로 가기로 접수 입력창에 돌아와 같은 사건을 다시 접수하지 않도록 replace로 이동한다.
 */
const CaseIntakePage = () => {
  const navigate = useNavigate()

  return (
    <section className="flex flex-1 flex-col bg-canvas pt-16.25">
      <BackHomeHeader title="사건 접수" homeTo={ROUTE_PATHS.home} onBack={() => navigate(-1)} />
      <IntakeForm
        onCreated={(createdCase) => navigate(getProsecutionPath(createdCase.id), { replace: true })}
      />
    </section>
  )
}

export default CaseIntakePage
