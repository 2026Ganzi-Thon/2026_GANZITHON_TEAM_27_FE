import starsUrl from '@/assets/header-stars.svg'

/**
 * 화면 상단 제목줄. 가운데에 제목, 제목 양옆에 별 장식을 보여준다. 사건 접수와 사건 목록 화면에서 함께 쓴다.
 * 제목줄의 위치(y=65)는 시안 기준이고, 양쪽 버튼은 44px 터치 영역이 제목 높이 가운데에 오도록 위로 올려 둔다.
 * 왼쪽과 오른쪽 끝에는 뒤로 가기나 홈 아이콘 같은 버튼을 넣을 수 있다.
 *
 * @param {{ title: string, left?: import('react').ReactNode, right?: import('react').ReactNode }} props
 * - `title`: 가운데 제목
 * - `left`: 왼쪽 끝에 놓을 요소(44px 크기의 버튼·링크)
 * - `right`: 오른쪽 끝에 놓을 요소(44px 크기의 버튼·링크)
 */
export const PageHeader = ({ title, left, right }) => (
  <header className="relative h-11 shrink-0">
    {left && <div className="absolute -top-[14.5px] left-1">{left}</div>}
    <img
      src={starsUrl}
      alt=""
      width={277}
      height={15}
      className="absolute top-0 left-15.75"
      aria-hidden="true"
    />
    <h1 className="absolute top-0 left-1/2 -translate-x-1/2 text-base leading-[normal] font-semibold text-ink">
      {title}
    </h1>
    {right && <div className="absolute -top-[14.5px] right-1">{right}</div>}
  </header>
)
