import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 로그인 상태 저장소. 새로고침해도 유지되도록 localStorage('auth')에 저장한다.
 * user가 null이면 로그인하지 않은 상태다.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth' },
  ),
)
