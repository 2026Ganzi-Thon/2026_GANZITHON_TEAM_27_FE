import { useState } from 'react'
import { createPost } from '../api/createPost'

/** 공유 결과. `shared`: 게시됨, `support_required`: 위기 안내로 바뀜, `failed`: 실패 */
export const SHARE_RESULT = {
  shared: 'shared',
  supportRequired: 'support_required',
  failed: 'failed',
}

/**
 * 사건을 게시판에 공유하는 hook.
 *
 * 비밀번호가 요청에 들어가므로 TanStack Query의 mutation(캐시에 남는다)을 쓰지 않고,
 * 이 hook 안의 상태로만 진행 상태를 다룬다. (명세: 비밀번호를 URL·캐시·전역 상태에 저장하지 않는다)
 *
 * @returns {{
 *   share: (caseId: string, values: object) => Promise<'shared' | 'support_required' | 'failed'>,
 *   isPending: boolean,
 *   isError: boolean,
 * }}
 * - `share`: 공유를 요청하고 결과(`SHARE_RESULT`)를 돌려준다. 실패해도 예외를 던지지 않는다
 */
export const useSharePost = () => {
  const [state, setState] = useState({ isPending: false, isError: false })

  /** 게시글을 만든다. 실패해도 예외를 던지지 않고 `isError`로 알린다. */
  const share = async (caseId, values) => {
    setState({ isPending: true, isError: false })
    try {
      const result = await createPost(caseId, values)
      setState({ isPending: false, isError: false })
      return result?.outcome === 'support_required'
        ? SHARE_RESULT.supportRequired
        : SHARE_RESULT.shared
    } catch {
      setState({ isPending: false, isError: true })
      return SHARE_RESULT.failed
    }
  }

  return { share, ...state }
}
