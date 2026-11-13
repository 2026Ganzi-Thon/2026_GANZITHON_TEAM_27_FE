/**
 * 라우트 주소 상수. 주소와 이름은 docs/routes.md가 기준이며, 바꾸면 docs/routes.md도 함께 갱신한다.
 * TODO(피그마 확인 필요): 피그마 `화면 이동` 페이지 기준으로 화면 주소를 추가한다.
 */
export const ROUTE_PATHS = {
  home: '/',
  // TODO(피그마 확인 필요): 사건 접수 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  caseNew: '/cases/new',
  // TODO(피그마 확인 필요): 사건 카드 화면 주소(사건 종결 후). `화면 이동` 페이지 기준으로 확정한다.
  caseCard: '/cases/:caseId/card',
  // TODO(피그마 확인 필요): 게시판 공유 설정 화면과 게시 완료 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  communityShare: '/cases/:caseId/share',
  communityShared: '/community/shared',
  // TODO(피그마 확인 필요): `화면 이동` 페이지 기준으로 주소를 확정한다.
  login: '/login',
  signup: '/signup',
  consent: '/consent',
  // TODO(피그마 확인 필요): 하단 탭바 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  community: '/community',
  court: '/court',
  // TODO(피그마 확인 필요): 기소 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  prosecution: '/cases/:caseId/prosecution',
  // TODO(피그마 확인 필요): 변론(AI 챗봇) 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  defense: '/cases/:caseId/defense',
  // TODO(피그마 확인 필요): 판결 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  decision: '/cases/:caseId/decision',
  // TODO(피그마 확인 필요): 감정 변화 화면 주소. `화면 이동` 페이지 기준으로 확정한다.
  emotion: '/cases/:caseId/emotion',
  // TODO(피그마 확인 필요): 행동 제안 화면(Figma 2-7, 감정 변화 다음) 주소. `화면 이동` 페이지 기준으로 확정한다.
  caseAction: '/cases/:caseId/action',
  // TODO(피그마 확인 필요): 위기 안내 화면 주소. 어느 화면에서든 오는 공용 화면이라 사건 ID를 넣지 않는다.
  crisisSupport: '/support',
  // TODO(피그마 확인 필요): `화면 이동` 페이지 기준으로 주소를 확정한다. :id는 사건 ID(UUID)다.
  caseClosing: '/cases/:id/closing',
}

/** 사건 카드 화면 주소를 사건 ID로 만든다. 예: `getCaseCardPath('abc')` → `/cases/abc/card` */
export const getCaseCardPath = (caseId) => `/cases/${caseId}/card`

/** 게시판 공유 화면 주소를 사건 ID로 만든다. 예: `getCommunitySharePath('abc')` → `/cases/abc/share` */
export const getCommunitySharePath = (caseId) => `/cases/${caseId}/share`

/** 변론(AI 챗봇) 화면 주소를 사건 ID로 만든다. 예: `getDefensePath('abc')` → `/cases/abc/defense` */
export const getDefensePath = (caseId) => `/cases/${caseId}/defense`

/** 판결 화면 주소를 사건 ID로 만든다. 예: `getDecisionPath('abc')` → `/cases/abc/decision` */
export const getDecisionPath = (caseId) => `/cases/${caseId}/decision`

/** 감정 변화 화면 주소를 사건 ID로 만든다. 예: `getEmotionPath('abc')` → `/cases/abc/emotion` */
export const getEmotionPath = (caseId) => `/cases/${caseId}/emotion`

/** 행동 제안 화면 주소를 사건 ID로 만든다. 예: `getCaseActionPath('abc')` → `/cases/abc/action` */
export const getCaseActionPath = (caseId) => `/cases/${caseId}/action`

/** 하단 탭바(BottomTabBar)에 넘기는 탭별 이동 주소. */
export const TAB_PATHS = {
  home: ROUTE_PATHS.home,
  community: ROUTE_PATHS.community,
  court: ROUTE_PATHS.court,
}
