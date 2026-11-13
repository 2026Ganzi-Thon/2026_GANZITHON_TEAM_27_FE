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
 */
export const SummaryView = ({ caseId, confirmTo, makeCardTo, onShare }) => {
  const summaryQuery = useCaseSummary(caseId)

  const renderBody = () => {
    if (summaryQuery.isPending) {
      // TODO(피그마 확인 필요): 불러오는 중 디자인이 없다.
      return (
        <p role="status" className="m-auto text-sm text-muted">
          사건파일을 불러오고 있어요…
        </p>
      )
    }

    if (summaryQuery.isError) {
      // TODO(피그마 확인 필요): 불러오기 실패·사건 없음(404) 디자인이 없다.
      const notFound = summaryQuery.error?.response?.status === 404
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

    const view = toSummaryView(summaryQuery.data)
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
        {/* TODO(API 확인 필요): "사건 유형"에 대응하는 응답 필드가 명세에 없다(목업은 case_type 임시 필드). */}
        <SummaryCard title="사건 유형" content={view.caseType} tone="slate" className="mt-2.75" />
        <EmotionChangeChart emotion={view.emotion} />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-16.25">
      <SummaryHeader onShare={onShare} />
      {renderBody()}
      <SummaryActions confirmTo={confirmTo} makeCardTo={makeCardTo} />
    </div>
  )
}
