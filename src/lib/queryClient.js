import { QueryClient } from '@tanstack/react-query'

/**
 * 앱 전체에서 공유하는 TanStack Query 클라이언트.
 * Mutation은 자동으로 재시도하지 않는다. 실패하면 사용자가 직접 다시 시도한다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
  },
})
