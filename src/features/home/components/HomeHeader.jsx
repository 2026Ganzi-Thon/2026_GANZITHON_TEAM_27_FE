import logoUrl from '@/assets/thought-court-logo.svg'
import starsUrl from '@/assets/home/home-stars.svg'

/**
 * 홈 화면 상단. 서비스 로고와 하늘색 별 띠를 보여준다.
 */
export const HomeHeader = () => (
  <header className="relative h-29 shrink-0 bg-field">
    <h1 className="absolute top-12.5 left-11">
      <img src={logoUrl} alt="Thought Court" width={322} height={34} />
    </h1>
    <div className="absolute inset-x-0 bottom-0 h-4.75 bg-sky" aria-hidden="true">
      <img src={starsUrl} alt="" width={373} height={15} className="absolute top-0.5 left-4" />
    </div>
  </header>
)
