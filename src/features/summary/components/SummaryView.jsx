import { useEffect, useRef } from 'react'
import { useCaseSummary } from '../hooks/useSummary'
import { toSummaryView } from '../utils'
import { EmotionChangeChart } from './EmotionChangeChart'
import { SummaryActions } from './SummaryActions'
import { SummaryCard } from './SummaryCard'
import { SummaryHeader } from './SummaryHeader'

/**
 * 사건요약 화면 본문 (Figma `사건요약`, 402×874, 스크롤 없음).
 * 사건번호, 처음 든 생각·최종판결·사건 유형 카드, 감정 변화 그래프, 하단 버튼을 보여준다.
 * 맨 위 44px은 기기 상태바 자리라 비우고, 제목줄은 Figma처럼 y 65에서 시작한다.
 *
 * @param {object} props
 * @param {string} props.caseId 사건 ID
 * @param {string} props.confirmTo "확인" 이동 주소
 * @param {string} props.makeCardTo "사건카드 만들기" 이동 주소
 * @param {() => void} [props.onShare] 공유 핸들러 (없으면 공유 버튼 비활성)
 * @param {'top' | 'emotion'} [props.scrollTarget] 처음 보여줄 위치. 'emotion'이면 감정 변화 그래프로 바로 스크롤한다.
 */
export const SummaryView = ({ caseId, confirmTo, makeCardTo, onShare, scrollTarget = 'top' }) => {
  const summaryQuery = useCaseSummary(caseId)
  const rootRef = useRef(null)
  const emotionRef = useRef(null)

  // 내용을 다 불러온 뒤 처음 위치를 맞춘다. 화면은 RootLayout의 main 안에서 스크롤되고, 그래프는 불러온 뒤에야
  // 그려지므로 브라우저 기본 #이동 대신 직접 옮긴다. 그래프로 갈 때는 화면 읽기 프로그램도 그 위치에서 읽도록 포커스한다.
  const isReady = Boolean(summaryQuery.data?.intake)
  useEffect(() => {
    if (!isReady) return
    if (scrollTarget === 'emotion' && emotionRef.current) {
      emotionRef.current.scrollIntoView?.({ block: 'start' })
      emotionRef.current.focus({ preventScroll: true })
      return
    }
    rootRef.current?.closest('main')?.scrollTo?.({ top: 0 })
  }, [isReady, scrollTarget])

  const renderBody = () => {
    if (summaryQuery.isPending) {
      // TODO(피그마 확인 필요): 불러오는 중 디자인이 없다.
      return (
        <p role="status" className="m-auto text-sm text-muted">
          사건파일을 불러오고 있어요…
        </p>
      )
    }

    // 사건 접수 기록이 없으면(목업 저장소에 없음, 서버 404) 찾을 수 없다고 알린다.
    const notFound =
      summaryQuery.error?.response?.status === 404 ||
      (!summaryQuery.isError && !summaryQuery.data?.intake)
    if (summaryQuery.isError || notFound) {
      // TODO(피그마 확인 필요): 불러오기 실패·사건 없음(404) 디자인이 없다.
      return (
        <div role="alert" className="m-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-ink">
            {notFound ? '사건을 찾을 수 없어요.' : '사건파일을 불러오지 못했어요.'}
          </p>
          {!notFound && (
            <button
              type="button"
              onClick={() => summaryQuery.refetch()}
              disabled={summaryQuery.isFetching}
              className="min-h-11 rounded-full bg-ink px-6 text-sm font-semibold text-field disabled:opacity-60"
            >
              다시 시도
            </button>
          )}
        </div>
      )
    }

    const view = toSummaryView(summaryQuery.data.intake, summaryQuery.data.result)
    return (
      <>
        {/* Figma 사건번호: (18, 144) */}
        <p className="mt-8.75 ml-4.5 h-4.75 shrink-0 text-base leading-[normal] font-semibold text-ink">
          {view.caseNumber ? `사건번호 #${view.caseNumber}` : ''}
        </p>
        {/* Figma 카드: x 17, y 180 / 265 / 350 (사이 11px) */}
        <SummaryCard title="처음 든 생각" content={view.thought} tone="gray" className="mt-4.25" />
        <SummaryCard
          title="최종판결"
          content={view.finalStatement}
          tone="ink"
          className="mt-2.75"
        />
        {/* 사건 유형: 확정한 사고 패턴 중 대표 1개(toSummaryView). TODO(API 확인 필요: 대표 패턴을 서버가 정하는지) */}
        <SummaryCard title="사건 유형" content={view.caseType} tone="slate" className="mt-2.75" />
        <EmotionChangeChart ref={emotionRef} emotion={view.emotion} />
      </>
    )
  }

  return (
    <div ref={rootRef} className="flex flex-1 flex-col bg-canvas pt-16.25">
      <SummaryHeader onShare={onShare} />
      {renderBody()}
      <SummaryActions confirmTo={confirmTo} makeCardTo={makeCardTo} />
    </div>
  )
}
