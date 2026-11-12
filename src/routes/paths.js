/**
 * 라우트 주소 상수. 주소와 이름은 docs/routes.md가 기준이며, 바꾸면 docs/routes.md도 함께 갱신한다.
 * TODO(피그마 확인 필요): 피그마 `화면 이동` 페이지 기준으로 화면 주소를 추가한다.
 */
export const ROUTE_PATHS = {
  home: '/',
  // TODO(피그마 확인 필요): 사건 접수 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  caseNew: '/cases/new',
  // TODO(피그마 확인 필요): `화면 이동` 페이지 기준으로 주소를 확정한다.
  login: '/login',
  signup: '/signup',
  consent: '/consent',
  // TODO(피그마 확인 필요): 하단 탭바 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  community: '/community',
  court: '/court',
}

/** 하단 탭바(BottomTabBar)에 넘기는 탭별 이동 주소. */
export const TAB_PATHS = {
  home: ROUTE_PATHS.home,
  community: ROUTE_PATHS.community,
  court: ROUTE_PATHS.court,
}
