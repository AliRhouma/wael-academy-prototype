import { useEffect } from "react"
import { useAuth } from "@/stores/useAuth"
import { DemoStatesProvider, StatesDock } from "./demoStates"
import { DownloadsProvider } from "./downloads"
import { mountSound } from "./sound"
import { V2Shell } from "./V2Shell"

/**
 * The new élève space. Same demo user, same store as /student — a second
 * front-end over one academy, not a fifth role. It seats the student in the
 * auth store (so a deep link works), stamps Arabic RTL on <html> the way
 * RoleLayout does, and hands off to its own shell.
 */
export default function V2Layout() {
  const currentRole = useAuth((s) => s.currentRole)
  const currentUser = useAuth((s) => s.currentUser)
  const setRole = useAuth((s) => s.setRole)

  useEffect(() => {
    if (currentRole !== "student") setRole("student")
  }, [currentRole, setRole])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("lang", "ar-TN")
    root.setAttribute("dir", "rtl")
  }, [])

  // Sound — every `data-uisfx` in the space plays its cue while it's mounted.
  useEffect(() => mountSound(), [])

  if (currentRole !== "student" || !currentUser) return null

  return (
    <DemoStatesProvider>
      <DownloadsProvider>
        <V2Shell />
        <StatesDock />
      </DownloadsProvider>
    </DemoStatesProvider>
  )
}
