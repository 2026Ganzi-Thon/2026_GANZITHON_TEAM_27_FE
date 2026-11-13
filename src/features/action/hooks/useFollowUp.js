import { useMutation } from '@tanstack/react-query'
import { putFollowUp } from '../api/followUp'

/**
 * 작은 행동 선택("LET’S DO IT" / "오늘은 쉬기")을 저장하는 mutation hook. 자동 재시도는 하지 않는다.
 * TODO(API 확인 필요): 저장 뒤 사건 상세(`GET /cases/{id}`) 캐시를 새로 받을지 정한다.
 * 위기 안내(`support_required`)로 바뀌면 보낸 행동 문장이 요청 기록(mutation 캐시)에 남지 않도록,
 * 화면이 reset하면 바로 지워지게 gcTime을 0으로 둔다.
 *
 * @returns TanStack Query mutation. `mutateAsync({ caseId, body })`로 부른다
 */
export const useFollowUp = () =>
  useMutation({
    mutationFn: ({ caseId, body }) => putFollowUp(caseId, body),
    gcTime: 0,
  })
