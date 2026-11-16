import { useNavigate } from 'react-router-dom'
import { CaseList } from '@/components/CaseList'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { useCases, useDeleteCase } from '@/features/case'
import { HomeHeader, HomeHero, NewCaseButton, ResumeCaseCard } from '@/features/home'
import { getCaseSummaryPath, ROUTE_PATHS, TAB_PATHS } from '@/routes/paths'

/**
 * 홈 화면 입구. 로고, 마스코트, 접수 버튼, 최근 사건파일, 탭바를 조합한다.
 * 진행 중인 사건이 있으면 재방문 모습(이어하기 카드와 "새 사건 접수하기")으로 바뀐다.
 * 사건파일은 사건 접수를 하면 만들어져서 최근 사건파일에 나타나고, 카드를 누르면 그 사건의 사건요약 화면으로 간다.
 * TODO(API 확인 필요): 사건 데이터는 `GET /cases` 연동 전까지 임시 저장소(mock)를 쓴다.
 */
const HomePage = () => {
  const { data: cases = [], isPending, isError } = useCases()
  const { mutate: deleteCase } = useDeleteCase()
  const navigate = useNavigate()
  const inProgress = cases.find((item) => item.isInProgress)

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <HomeHeader />
      <HomeHero variant={inProgress ? 'resume' : 'new'} />
      {inProgress ? (
        <>
          <div className="mt-0.75 flex flex-col">
            <ResumeCaseCard
              title={inProgress.title}
              dateLabel={inProgress.dotDate}
              statusLabel={inProgress.statusLabel}
              onDelete={() => deleteCase(inProgress.id)}
            />
          </div>
          <NewCaseButton to={ROUTE_PATHS.caseNew} label="새 사건 접수하기" className="mt-8" />
        </>
      ) : (
        <NewCaseButton to={ROUTE_PATHS.caseNew} />
      )}
      <CaseList
        cases={cases}
        isLoading={isPending}
        isError={isError}
        onSelectCase={(id) => navigate(getCaseSummaryPath(id))}
        className={inProgress ? 'mt-7.5' : 'mt-9.75'}
      />
      <BottomTabBar current="home" paths={TAB_PATHS} />
    </div>
  )
}

export default HomePage
