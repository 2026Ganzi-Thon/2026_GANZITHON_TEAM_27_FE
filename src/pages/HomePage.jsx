import { useNavigate } from 'react-router-dom'
import { CaseList } from '@/components/CaseList'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { useCases, useDeleteCase } from '@/features/case'
import { HomeHeader, HomeHero, NewCaseButton, ResumeCaseCard } from '@/features/home'
import { getCaseResumePath, ROUTE_PATHS, TAB_PATHS } from '@/routes/paths'

/**
 * 홈 화면 입구. 로고, 마스코트, 접수 버튼, 최근 사건파일, 탭바를 조합한다.
 * 사건파일이 하나라도 있으면 재방문 모습(가장 최근 사건 카드와 "새 사건 접수하기")으로 바뀌고, 사건파일이 없으면 처음 방문 모습이다.
 * 카드의 휴지통을 누르면 가장 최근 사건부터 하나씩 삭제되고, 모두 지우면 처음 방문 모습으로 돌아온다.
 * 사건파일은 사건 접수를 하면 만들어져서 최근 사건파일에 나타난다. 이어하기 카드와 사건 카드를 누르면 사건의 진행 상태에 맞는
 * 화면(기소·변론·판결, 종결된 사건은 사건요약)으로 간다.
 * TODO(API 확인 필요): 사건 데이터는 `GET /cases` 연동 전까지 임시 저장소(mock)를 쓴다.
 */
const HomePage = () => {
  const { data: cases = [], isPending, isError } = useCases()
  const { mutate: deleteCase } = useDeleteCase()
  const navigate = useNavigate()
  // 목록은 최근 사건이 먼저 온다. 재방문 카드는 가장 최근 사건이다(진행 중이든 종결됐든).
  const latest = cases[0]

  /** 카드를 누르면 사건의 진행 상태에 맞는 화면으로 간다(종결된 사건은 사건요약). */
  const openCase = (id) => {
    const item = cases.find((candidate) => candidate.id === id)
    if (item) navigate(getCaseResumePath(item.id, item.status))
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas">
      <HomeHeader />
      <HomeHero variant={latest ? 'resume' : 'new'} />
      {latest ? (
        <>
          <div className="mt-0.75 flex flex-col">
            <ResumeCaseCard
              title={latest.title}
              dateLabel={latest.dotDate}
              statusLabel={latest.statusLabel}
              onOpen={() => navigate(getCaseResumePath(latest.id, latest.status))}
              onDelete={() => deleteCase(latest.id)}
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
        onSelectCase={(id) => openCase(id)}
        className={latest ? 'mt-7.5' : 'mt-9.75'}
      />
      <BottomTabBar current="home" paths={TAB_PATHS} />
    </div>
  )
}

export default HomePage
