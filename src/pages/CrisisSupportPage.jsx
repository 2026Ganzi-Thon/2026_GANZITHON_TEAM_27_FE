import { CrisisSupportView } from '@/features/crisis'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 위기 안내 화면 입구 (Figma `5-1 위기 안내`). 사건 접수·기소·변론·챗봇 등 어느 화면에서든 이동하는 공용 페이지다.
 * 사건이 만들어지지 않은 경우(사건 접수에서 감지)도 있으므로 주소에 사건 ID를 넣지 않는다.
 * 사용자가 쓴 내용이나 감지된 단어를 주소·상태·저장소로 받지 않는다.
 *
 * TODO(기획 확인 필요: 명세 "흐름 중단"과 "계속할게요" 버튼 충돌) 확인 전까지 모든 이동을 홈으로 보낸다.
 */
const CrisisSupportPage = () => <CrisisSupportView homeTo={ROUTE_PATHS.home} />

export default CrisisSupportPage
