/**
 * 라우트 주소 상수. 주소와 이름은 docs/routes.md가 기준이며, 바꾸면 docs/routes.md도 함께 갱신한다.
 * TODO(피그마 확인 필요): 피그마 `화면 이동` 페이지 기준으로 화면 주소를 추가한다.
 */
export const ROUTE_PATHS = {
  home: '/',
  // TODO(피그마 확인 필요): 재방문 홈은 진행 중인 사건 유무로 `/`에서 분기할지, 별도 주소를 쓸지 정한다.
  homeResume: '/home/resume',
  // TODO(피그마 확인 필요): `화면 이동` 페이지 기준으로 주소를 확정한다.
  login: '/login',
  signup: '/signup',
  consent: '/consent',
  // TODO(피그마 확인 필요): 하단 탭바 이동용 임시 주소. 화면은 아직 없다.
  board: '/board',
  summary: '/summary',
}
