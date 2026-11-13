import { ClosingView } from '@/features/closing'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건 종결 화면 입구 (Figma `2-8 종결`). 카드와 확인 버튼의 이동 주소를 정해 closing feature에 넘긴다.
 * 종결 화면은 고정 문구라 API를 부르지 않는다.
 *
 * TODO(피그마 확인 필요): "사건파일 요약"은 사건 요약 화면(Figma `사건요약`), "감정 변화 확인"은 감정 비교 화면으로
 * 이동해야 하지만 아직 라우트가 없다. 화면이 생기면 사건 ID(`useParams().id`)로 주소를 만든다. 지금은 홈으로 보낸다.
 * TODO(피그마 확인 필요): "확인" 이후 이동할 화면이 정해지지 않아 홈으로 보낸다.
 */
const CaseClosingPage = () => (
  <ClosingView
    summaryTo={ROUTE_PATHS.home}
    emotionTo={ROUTE_PATHS.home}
    confirmTo={ROUTE_PATHS.home}
  />
)

export default CaseClosingPage
