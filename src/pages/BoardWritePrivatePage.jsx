import { BoardPrivateSettings } from '@/features/board'

/** 비공개 설정 캡처를 입력 데이터 없이 확인하는 전용 프리뷰 경로. */
const BoardWritePrivatePage = () => <BoardPrivateSettings onSubmit={() => {}} />

export default BoardWritePrivatePage
