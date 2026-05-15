"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type {
  ActionLogEntry,
  AdPlatform,
  ApprovedActionDraft,
  WriteAccessState,
} from "./types"

/**
 * The mock current user. In production this would come from auth.
 */
const MOCK_USER = "michael@optilytics.com"

/**
 * Initial write-access state for the beta. Meta has full write access
 * via the Meta Marketing API; Google is connected read-only and needs
 * an additional Ads API permission grant before writes are enabled.
 * This is intentionally asymmetric so the UI gets to demonstrate all
 * three states.
 */
const DEFAULT_WRITE_ACCESS: Record<AdPlatform, WriteAccessState> = {
  meta: "write_access_connected",
  google: "read_only_connected",
}

/**
 * A few seeded log entries so the Action Log sheet isn't empty on first
 * open. They reflect actions a real operator might already have approved.
 */
const SEED_LOG: ActionLogEntry[] = [
  {
    id: "log_seed_1",
    user: MOCK_USER,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    platform: "meta",
    objectType: "ad_set",
    objectName: "Lookalike 1% - Purchasers",
    actionType: "increase_budget",
    previousValue: "$240/day",
    newValue: "$280/day",
    status: "success",
    platformResponse: "200 OK · adset.budget updated · request_id meta_8a3c91",
  },
  {
    id: "log_seed_2",
    user: MOCK_USER,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(),
    platform: "meta",
    objectType: "campaign",
    objectName: "Retargeting - 30 Day",
    actionType: "pause",
    previousValue: "Active",
    newValue: "Paused",
    status: "success",
    platformResponse: "200 OK · campaign.status=PAUSED · request_id meta_4f7d12",
  },
]

interface PreviewModalState {
  open: boolean
  draft: ApprovedActionDraft | null
}

interface LogSheetState {
  open: boolean
  /** When set, the sheet should scroll to and emphasize this entry. */
  highlightEntryId: string | null
}

/**
 * Submission status of a given draft. Derived purely from the log so it
 * always matches what a stakeholder would see in the audit trail.
 *
 * - available: no log entry exists yet (default)
 * - submitted: most recent matching entry is success or queued
 * - failed:    most recent matching entry is failed
 */
export type DraftSubmissionStatus = "available" | "submitted" | "failed"

interface ApprovedActionsContextValue {
  // Connection / write access state per platform.
  writeAccess: Record<AdPlatform, WriteAccessState>
  setWriteAccess: (platform: AdPlatform, state: WriteAccessState) => void

  // Preview modal control.
  openPreview: (draft: ApprovedActionDraft) => void
  closePreview: () => void
  preview: PreviewModalState

  // Action log.
  log: ActionLogEntry[]
  appendLogEntry: (entry: ActionLogEntry) => void
  /**
   * Returns the most recent log entry that matches the given draft on
   * platform + objectType + objectName + actionType. Used by every
   * surface that shows the executable state to determine whether the
   * action has already been submitted.
   */
  findLatestEntryForDraft: (
    draft: ApprovedActionDraft,
  ) => ActionLogEntry | null

  // Action Log sheet control. Controlled here so any surface (cell,
  // drawer, AI card) can deep-link into the audit trail and optionally
  // highlight the entry that was just created.
  logSheet: LogSheetState
  openLog: (highlightEntryId?: string) => void
  closeLog: () => void

  // Currently authenticated user (mocked).
  currentUser: string
}

const ApprovedActionsContext =
  createContext<ApprovedActionsContextValue | null>(null)

export function ApprovedActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [writeAccess, setWriteAccessState] =
    useState<Record<AdPlatform, WriteAccessState>>(DEFAULT_WRITE_ACCESS)
  const [preview, setPreview] = useState<PreviewModalState>({
    open: false,
    draft: null,
  })
  const [log, setLog] = useState<ActionLogEntry[]>(SEED_LOG)
  const [logSheet, setLogSheet] = useState<LogSheetState>({
    open: false,
    highlightEntryId: null,
  })

  const setWriteAccess = useCallback(
    (platform: AdPlatform, state: WriteAccessState) => {
      setWriteAccessState((prev) => ({ ...prev, [platform]: state }))
    },
    [],
  )

  const openPreview = useCallback((draft: ApprovedActionDraft) => {
    setPreview({ open: true, draft })
  }, [])

  const closePreview = useCallback(() => {
    // Keep the draft around briefly so the modal can animate out without
    // visually losing its content; we just flip `open`.
    setPreview((prev) => ({ ...prev, open: false }))
  }, [])

  const appendLogEntry = useCallback((entry: ActionLogEntry) => {
    setLog((prev) => [entry, ...prev])
  }, [])

  // The match is intentionally narrow — same platform, same object,
  // same action type. A different action type on the same object (e.g.
  // pause then later increase_budget) creates a fresh "available"
  // state for the new draft, which is what an operator would expect.
  const findLatestEntryForDraft = useCallback(
    (draft: ApprovedActionDraft): ActionLogEntry | null => {
      for (const entry of log) {
        if (
          entry.platform === draft.platform &&
          entry.objectType === draft.objectType &&
          entry.objectName === draft.objectName &&
          entry.actionType === draft.type
        ) {
          return entry
        }
      }
      return null
    },
    [log],
  )

  const openLog = useCallback((highlightEntryId?: string) => {
    setLogSheet({ open: true, highlightEntryId: highlightEntryId ?? null })
  }, [])

  const closeLog = useCallback(() => {
    setLogSheet({ open: false, highlightEntryId: null })
  }, [])

  const value = useMemo<ApprovedActionsContextValue>(
    () => ({
      writeAccess,
      setWriteAccess,
      openPreview,
      closePreview,
      preview,
      log,
      appendLogEntry,
      findLatestEntryForDraft,
      logSheet,
      openLog,
      closeLog,
      currentUser: MOCK_USER,
    }),
    [
      writeAccess,
      setWriteAccess,
      openPreview,
      closePreview,
      preview,
      log,
      appendLogEntry,
      findLatestEntryForDraft,
      logSheet,
      openLog,
      closeLog,
    ],
  )

  return (
    <ApprovedActionsContext.Provider value={value}>
      {children}
    </ApprovedActionsContext.Provider>
  )
}

export function useApprovedActions(): ApprovedActionsContextValue {
  const ctx = useContext(ApprovedActionsContext)
  if (!ctx) {
    throw new Error(
      "useApprovedActions must be used inside <ApprovedActionsProvider>",
    )
  }
  return ctx
}

/**
 * Derive the submission status of a draft and the matching log entry,
 * if any. Convenience hook used by every surface that shows the
 * executable state — the recommended-action cell, the row drawer, and
 * AI Assistant cards.
 */
export function useApprovedActionDraftStatus(draft: ApprovedActionDraft): {
  status: DraftSubmissionStatus
  entry: ActionLogEntry | null
} {
  const { findLatestEntryForDraft } = useApprovedActions()
  const entry = findLatestEntryForDraft(draft)
  if (!entry) return { status: "available", entry: null }
  if (entry.status === "failed") return { status: "failed", entry }
  return { status: "submitted", entry }
}
