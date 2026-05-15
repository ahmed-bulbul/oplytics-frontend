"use client"

import { useEffect, useState } from "react"
import { WelcomeModal } from "./welcome-modal"

const STORAGE_KEY = "optilytics-onboarded"
const REPLAY_EVENT = "optilytics:replay-onboarding"

export function dispatchReplayOnboarding() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(REPLAY_EVENT))
}

/**
 * Mounts at the app root (`app/layout.tsx`). The onboarding flow is
 * **manual-only** — it only opens when the user clicks "Restart onboarding"
 * in Settings, the Compass icon in the top bar, or any other place that
 * dispatches the replay event. Auto-show was disabled to keep the dashboard
 * immediately usable on every page load.
 */
export function OnboardingController() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Clear any stale flag from older builds that auto-opened on first load,
    // so users no longer have an invisible "already seen" state to deal with.
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }

    const onReplay = () => setOpen(true)
    window.addEventListener(REPLAY_EVENT, onReplay)
    return () => window.removeEventListener(REPLAY_EVENT, onReplay)
  }, [])

  const handleComplete = () => {
    // No-op now that auto-show is disabled. Kept so the modal's onComplete
    // signature is unchanged.
  }

  return (
    <WelcomeModal open={open} onOpenChange={setOpen} onComplete={handleComplete} />
  )
}
