import logoUrl from '@/assets/community/logo-two-line.svg'
import bellUrl from '@/assets/community/icon-bell.svg'
import starsUrl from '@/assets/home/home-stars.svg'

/**
 * 게시판 화면 상단. 두 줄짜리 THOUGHT COURT 로고, 알림 아이콘, 별 띠를 보여준다. 게시판 메인과 목록 화면에서 함께 쓴다.
 * TODO(피그마 확인 필요): 알림 화면과 알림 동작이 시안에 없어 알림 버튼은 눌러도 아무 일도 하지 않는다.
 */
export const BoardHeader = () => (
  <header className="relative h-32.25 shrink-0">
    <img
      src={logoUrl}
      alt="Thought Court"
      width={103}
      height={48}
      className="absolute top-13 left-5"
    />
    <button
      type="button"
      aria-label="알림"
      className="absolute top-13.75 right-1.5 flex size-11 items-center justify-center"
    >
      <img src={bellUrl} alt="" width={24} height={24} />
    </button>
    <div className="absolute inset-x-0 top-27.5 h-4.75 bg-sky" aria-hidden="true">
      <img src={starsUrl} alt="" width={373} height={15} className="absolute top-0.5 left-4" />
    </div>
  </header>
)
