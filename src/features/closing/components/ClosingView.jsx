import { Link } from 'react-router-dom'

/** 종결 안내를 화면 중앙에 표시하고 사건요약으로 연결한다. */
export const ClosingView = ({ confirmTo }) => (
  <div className="relative flex min-h-full flex-1 flex-col bg-canvas text-ink">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
      <div className="animate-closing-enter motion-reduce:animate-none">
        <h1 className="text-3xl leading-auto font-semibold">사건이 종결되었습니다</h1>
        <p className="mt-4.25 text-sm leading-[16.7px] whitespace-pre-wrap">
          {'지금까지의 재판을 \n확인해보세요'}
        </p>
      </div>
    </div>
    <div className="mt-auto px-4.5 pt-6 pb-9.5">
      <Link
        to={confirmTo}
        className="flex h-button items-center justify-center rounded-full bg-ink text-base leading-auto font-semibold text-canvas"
      >
        확인
      </Link>
    </div>
  </div>
)
