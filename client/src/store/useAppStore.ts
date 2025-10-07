import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface AppState {
  theme: Theme
  setTheme: (t: Theme) => void
  user: { uid: string; email?: string | null } | null
  setUser: (u: AppState['user']) => void
  partnerUid: string | null
  setPartnerUid: (uid: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
      user: null,
      setUser: (u) => set({ user: u }),
      partnerUid: null,
      setPartnerUid: (uid) => set({ partnerUid: uid }),
    }),
    { name: 'linkzy-app' }
  )
)

