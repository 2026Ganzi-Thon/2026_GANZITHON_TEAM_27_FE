import { useState } from 'react'
import { createPost } from '../api/createPost'

/**
 * 사건을 게시판에 공유하는 hook.
 *
 * 비밀번호가 요청에 들어가므로 TanStack Query의 mutation(캐시에 남는다)을 쓰지 않고,
 * 이 hook 안의 상태로만 진행 상태를 다룬다. (명세: 비밀번호를 URL·캐시·전역 상태에 저장하지 않는다)
 *
 * @returns {{
 *   share: (caseId: string, values: object) => Promise<boolean>,
 *   isPending: boolean,
 *   isError: boolean,
 * }}
 * - `share`: 공유를 요청한다. 성공하면 `true`, 실패하면 `false`를 돌려준다
 */
export const useSharePost = () => {
  const [state, setState] = useState({ isPending: false, isError: false })

  /** 게시글을 만든다. 실패해도 예외를 던지지 않고 `isError`로 알린다. */
  const share = async (caseId, values) => {
    setState({ isPending: true, isError: false })
    try {
      await createPost(caseId, values)
      setState({ isPending: false, isError: false })
      return true
    } catch {
      setState({ isPending: false, isError: true })
      return false
    }
  }

  return { share, ...state }
}
