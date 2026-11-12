import { Link } from 'react-router-dom'
import clipboardUrl from '@/assets/nav/nav-clipboard.svg'
import clipboardActiveUrl from '@/assets/nav/nav-clipboard-active.svg'
import ellipseUrl from '@/assets/nav/nav-ellipse.svg'
import gavelBaseUrl from '@/assets/nav/nav-gavel-base.svg'
import gavelBaseActiveUrl from '@/assets/nav/nav-gavel-base-active.svg'
import homeUrl from '@/assets/nav/nav-home.svg'
import homeInactiveUrl from '@/assets/nav/nav-home-inactive.svg'

/** 탭 목록. 순서가 화면 순서이고, `key`는 `current`와 `paths`의 키로 쓴다. */
const TABS = [
  { key: 'home', label: 'home' },
  { key: 'board', label: 'community' },
  { key: 'cases', label: 'court' },
]

/**
 * 선택된 탭(검은 알약)의 너비와 안쪽 글자·아이콘 위치. 시안(Figma)의 좌표를 그대로 옮겼다.
 * 글꼴이 달라져도 모양이 변하지 않도록 너비를 고정하고 글자와 아이콘을 절대 위치로 둔다.
 * court만 시안에서 아이콘이 글자 오른쪽에 있다.
 */
const PILL_LAYOUT = {
  home: { pill: 'w-28.75', label: 'left-[50.9px]', icon: 'left-[19px] top-[10px]' },
  board: { pill: 'w-36.5', label: 'left-[47px]', icon: 'left-[18px] top-[9px]' },
  cases: { pill: 'w-26.25', label: 'left-[14.6px]', icon: 'left-[63px] top-[7.3px]' },
}

/** 법봉 아이콘의 회전된 조각. 시안(Figma)의 좌표를 그대로 옮겼다. */
const GavelPiece = ({ boxClass, pieceClass, toneClass }) => (
  <span className={`absolute flex items-center justify-center ${boxClass}`} aria-hidden="true">
    <span className={`block flex-none rotate-[-37.15deg] ${toneClass} ${pieceClass}`} />
  </span>
)

/**
 * 법봉 아이콘. 선택된 탭에서는 하늘색, 선택되지 않은 탭에서는 검은색으로 그린다.
 *
 * @param {{ active: boolean }} props
 */
const GavelIcon = ({ active }) => {
  const toneClass = active ? 'bg-sky' : 'bg-black'
  return (
    <span className="relative block h-[36.188px] w-[34.186px] shrink-0" aria-hidden="true">
      <img
        src={active ? gavelBaseActiveUrl : gavelBaseUrl}
        alt=""
        width={19.29}
        height={6.48}
        className="absolute top-[25px] left-[-1px]"
      />
      <GavelPiece
        toneClass={toneClass}
        boxClass="top-[3.05px] left-[3.66px] h-[14.849px] w-[15.311px]"
        pieceClass="h-[9.568px] w-[11.96px]"
      />
      <GavelPiece
        toneClass={toneClass}
        boxClass="top-0 left-[13.35px] h-[10.823px] w-[9.283px]"
        pieceClass="h-[11.163px] w-[3.189px] rounded-[31px]"
      />
      <GavelPiece
        toneClass={toneClass}
        boxClass="top-[10.11px] left-0 h-[10.823px] w-[9.283px]"
        pieceClass="h-[11.163px] w-[3.189px] rounded-[31px]"
      />
      <GavelPiece
        toneClass={toneClass}
        boxClass="top-[13.71px] left-[13.1px] h-[17.66px] w-[14.734px]"
        pieceClass="h-[19.136px] w-[3.987px] rounded-b-[31px]"
      />
    </span>
  )
}

/** 선택된 탭(검은 알약) 안에 들어가는 하늘색 아이콘. */
const ActiveIcon = ({ tabKey }) => {
  if (tabKey === 'home') return <img src={homeUrl} alt="" width={23} height={25} />
  if (tabKey === 'board') return <img src={clipboardActiveUrl} alt="" width={22} height={28} />
  return <GavelIcon active />
}

/** 선택되지 않은 탭(흰 동그라미) 안의 아이콘. 홈은 동그라미까지 한 장의 그림이다. */
const InactiveIcon = ({ tabKey }) => {
  if (tabKey === 'home') {
    return <img src={homeInactiveUrl} alt="" className="absolute inset-0 size-full" />
  }
  return (
    <>
      <img src={ellipseUrl} alt="" className="absolute inset-0 size-full" />
      {tabKey === 'board' ? (
        <img
          src={clipboardUrl}
          alt=""
          width={22}
          height={28}
          className="absolute top-2.5 left-3.25"
        />
      ) : (
        <span className="absolute top-1 left-2.75">
          <GavelIcon active={false} />
        </span>
      )}
    </>
  )
}

/**
 * 하단 공통 탭바(home, community, court). 프레임 안에서 `sticky`로 아래에 붙는다.
 * 바 크기는 어느 탭이 선택돼도 같다(너비 299px, 높이 72px). 탭 사이는 균등 간격이다.
 * 현재 탭은 하늘색 아이콘과 이름이 있는 검은 알약으로, 나머지 탭은 아이콘만 있는 흰 동그라미로 보여준다.
 * 공통 코드는 routes에 의존할 수 없어서 이동 주소는 페이지가 `ROUTE_PATHS`에서 골라 넘긴다.
 *
 * @param {{
 *   current: 'home' | 'board' | 'cases',
 *   paths: { home: string, board: string, cases: string },
 * }} props
 * - `current`: 지금 보고 있는 탭
 * - `paths`: 탭별 이동 주소
 *
 * @example
 * <BottomTabBar current="home" paths={{ home: '/', board: '/board', cases: '/cases' }} />
 */
export const BottomTabBar = ({ current, paths }) => (
  <nav
    aria-label="주요 메뉴"
    className="sticky bottom-5.75 z-10 mx-auto mt-auto flex h-18 w-74.75 shrink-0 items-center justify-evenly rounded-[55px] bg-ink/20"
  >
    {TABS.map(({ key, label }) =>
      key === current ? (
        <Link
          key={key}
          to={paths[key]}
          aria-current="page"
          className={`relative h-11.75 shrink-0 rounded-[23px] bg-black text-base font-semibold whitespace-nowrap text-sky ${PILL_LAYOUT[key].pill}`}
        >
          <span className={`absolute ${PILL_LAYOUT[key].icon}`}>
            <ActiveIcon tabKey={key} />
          </span>
          <span className={`absolute top-1/2 -translate-y-1/2 ${PILL_LAYOUT[key].label}`}>
            {label}
          </span>
        </Link>
      ) : (
        <Link
          key={key}
          to={paths[key]}
          aria-label={label}
          className="relative size-11.75 shrink-0 rounded-full"
        >
          <InactiveIcon tabKey={key} />
        </Link>
      ),
    )}
  </nav>
)
