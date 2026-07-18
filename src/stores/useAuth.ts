import { create } from "zustand"
import type { Role, User } from "@/data/types"
import usersSeed from "@/data/seed/users.json"

const USERS = usersSeed as unknown as User[]

/**
 * Auth store — holds the current role + its demo user. No backend: `setRole`
 * just picks that role's seeded demo user. Starts with nothing selected; the
 * root "/" role switcher chooses.
 */
interface AuthState {
  currentRole: Role | null
  currentUser: User | null
  setRole: (role: Role) => void
}

export const useAuth = create<AuthState>()((set) => ({
  currentRole: null,
  currentUser: null,
  setRole: (role) =>
    set({ currentRole: role, currentUser: USERS.find((u) => u.role === role) ?? null }),
}))
