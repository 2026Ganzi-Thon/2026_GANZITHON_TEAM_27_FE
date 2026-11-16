import { useOutletContext } from 'react-router-dom'
import { BoardPrivateSettings } from '@/features/board'

/** 글쓰기 상태를 유지하는 하위 라우트. 비밀번호는 이 화면에서만 보관한다. */
const BoardWritePrivatePage = () => {
  const { submitPrivate, closePrivate } = useOutletContext()
  return <BoardPrivateSettings onSubmit={submitPrivate} onClose={closePrivate} />
}

export default BoardWritePrivatePage
