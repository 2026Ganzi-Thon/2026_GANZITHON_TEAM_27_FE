import { useMutation } from '@tanstack/react-query'
import { login } from '../api/login'
import { useAuthStore } from '../store'

/**
 * 로그인 mutation 훅. 성공하면 사용자 정보를 로그인 상태에 저장한다.
 * @returns 로그인 요청의 `mutate`, `isPending`, `error` 등
 */
export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => setUser(user),
  })
}
