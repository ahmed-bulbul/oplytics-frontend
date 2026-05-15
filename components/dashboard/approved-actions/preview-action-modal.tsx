"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Pause,
  Play,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  ACTION_TYPE_LABEL,
  OBJECT_TYPE_LABEL,
  PLATFORM_LABEL,
  WRITE_ACCESS_LABEL,
  type ApprovedActionDraft,
  type ApprovedActionType,
  type GuardrailFlag,
} from "./types"
import { evaluateGuardrails, hasBlockingGuardrail } from "./guardrails"
import { useApprovedActions } from "./approved-actions-context"

/**
 * Preview Action modal — the only path to executing an approved action.
 *
 * The product principle is "AI recommends. Human approves. Optilytics
 * executes and logs." That principle is enforced here by:
 *   1. Showing every dimension of the change before submission
 *      (platform, object, current → proposed, reason, evidence, risk).
 *   2. Requiring an explicit confirmation checkbox.
 *   3. Disabling submission whenever a blocking guardrail trips OR the
 *      platform connection lacks write access.
 *   4. Producing an Action Log entry on submit, never on cancel.
 *
 * The modal reads its open/close state and current draft from
 * `useApprovedActions()` so it can be triggered from anywhere in the app
 * (Action Center cells, row drawer, AI Assistant cards).
 */

const ACTION_ICON: Record<ApprovedActionType, typeof Pause> = {
  pause: Pause,
  enable: Play,
  increase_budget: TrendingUp,
  decrease_budget: TrendingDown,
  set_budget: TrendingUp,
}

function GuardrailRow({ flag }: { flag: GuardrailFlag }) {
  const Icon =
    flag.severity === "blocking"
      ? XCircle
      : flag.severity === "warning"
        ? AlertTriangle
        : CheckCircle2

  const styles =
    flag.severity === "blocking"
      ? "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400"
      : flag.severity === "warning"
        ? "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400"
        : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"

  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-2", styles)}>
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold leading-tight">{flag.label}</p>
        <p className="text-[11px] leading-snug text-foreground/80">
          {flag.detail}
        </p>
      </div>
    </div>
  )
}

export function PreviewActionModal() {
  const {
    preview,
    closePreview,
    appendLogEntry,
    writeAccess,
    currentUser,
  } = useApprovedActions()

  const draft = preview.draft
  const open = preview.open

  const [confirmed, setConfirmed] = useState(false)
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "submitted"
  >("idle")

  // Reset confirmation when a new draft arrives or the modal closes.
  useMemo(() => {
    if (open) {
      setConfirmed(false)
      setSubmitState("idle")
    }
  }, [open, draft?.objectName, draft?.type])

  if (!draft) {
    // Render the dialog shell so close transitions still work even when
    // the draft has been cleared after submit.
    return (
      <Dialog open={open} onOpenChange={(o) => !o && closePreview()}>
        <DialogContent className="max-w-md" />
      </Dialog>
    )
  }

  const guardrails = evaluateGuardrails(draft)
  const blocked = hasBlockingGuardrail(guardrails)
  const accessState = writeAccess[draft.platform]
  const writeBlocked = accessState !== "write_access_connected"
  const Icon = ACTION_ICON[draft.type]

  const canSubmit =
    confirmed && !blocked && !writeBlocked && submitState === "idle"

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitState("submitting")

    // Mock platform round-trip. Production would call the platform API
    // (Meta Marketing API / Google Ads API) and persist the response.
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    appendLogEntry({
      id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      platform: draft.platform,
      objectType: draft.objectType,
      objectName: draft.objectName,
      actionType: draft.type,
      previousValue: draft.currentValueLabel,
      newValue: draft.proposedValueLabel,
      status: "success",
      platformResponse:
        draft.platform === "meta"
          ? `200 OK · ${draft.objectType}.${
              draft.type === "pause" || draft.type === "enable" ? "status" : "budget"
            } updated · request_id meta_${id.slice(-6)}`
          : `OK · resourceName updated · request_id google_${id.slice(-6)}`,
    })

    // Tiny delay so the success state is visible.
    setTimeout(() => {
      setSubmitState("submitted")
    }, 350)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closePreview()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="mr-1 inline h-3 w-3" aria-hidden="true" />
              Preview before approval
            </span>
          </div>
          <DialogTitle className="text-base">
            {ACTION_TYPE_LABEL[draft.type]} · {draft.objectName}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            AI recommends. Human approves. Optilytics executes and logs. No
            changes are submitted to {PLATFORM_LABEL[draft.platform]} until
            you click <span className="font-medium">Approve and submit</span>.
          </DialogDescription>
        </DialogHeader>

        {submitState === "submitted" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Action submitted</p>
              <p className="text-[11px] text-muted-foreground">
                {ACTION_TYPE_LABEL[draft.type]} on{" "}
                {OBJECT_TYPE_LABEL[draft.objectType].toLowerCase()}{" "}
                <span className="font-medium text-foreground">
                  {draft.objectName}
                </span>{" "}
                was sent to {PLATFORM_LABEL[draft.platform]} and recorded in
                the Action Log.
              </p>
            </div>
            <Button
              size="sm"
              onClick={closePreview}
              className="h-8 mt-2 text-[11px]"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Identity row: platform · object type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Platform
                </p>
                <p className="text-xs font-medium">
                  {PLATFORM_LABEL[draft.platform]}
                </p>
              </div>
              <div className="rounded-md border border-border p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Object
                </p>
                <p className="text-xs font-medium">
                  {OBJECT_TYPE_LABEL[draft.objectType]} · {draft.objectName}
                </p>
              </div>
            </div>

            {/* Current → proposed */}
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-[9px] uppercase tracking-wider text-muted-foreground">
                Change
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-md bg-muted/40 p-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Current
                  </p>
                  <p className="text-sm font-semibold">
                    {draft.currentValueLabel}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                  <p className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Proposed
                  </p>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {draft.proposedValueLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                Reason
              </p>
              <p className="text-[11px] leading-relaxed text-foreground">
                {draft.reason}
              </p>
            </div>

            {/* Evidence */}
            {draft.evidence.length > 0 && (
              <div>
                <p className="mb-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                  Evidence
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-md bg-muted/40 px-3 py-2">
                  {draft.evidence.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-[11px] font-semibold",
                            item.trend === "positive" && "text-emerald-600",
                            item.trend === "negative" && "text-rose-600",
                            (!item.trend || item.trend === "neutral") &&
                              "text-foreground",
                          )}
                        >
                          {item.value}
                        </span>
                        {item.comparison && (
                          <span className="text-[9px] text-muted-foreground">
                            {item.comparison}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk / watchout */}
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
              <div className="flex items-start gap-1.5">
                <AlertTriangle
                  className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Risk / watchout
                  </p>
                  <p className="text-[11px] leading-relaxed text-foreground">
                    {draft.riskWatchout}
                  </p>
                </div>
              </div>
            </div>

            {/* Guardrails */}
            <div>
              <p className="mb-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                Guardrails
              </p>
              <div className="space-y-1.5">
                {guardrails.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    All guardrails passed.
                  </div>
                ) : (
                  guardrails.map((flag, idx) => (
                    <GuardrailRow key={idx} flag={flag} />
                  ))
                )}
              </div>
            </div>

            {/* Write-access state */}
            {writeBlocked && (
              <div className="flex items-start gap-2 rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5">
                <Lock
                  className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                    {WRITE_ACCESS_LABEL[accessState]}
                  </p>
                  <p className="text-[11px] leading-snug text-foreground/80">
                    {PLATFORM_LABEL[draft.platform]} is connected{" "}
                    {accessState === "read_only_connected" ? "read-only" : "but missing the required scope"}
                    . Grant write access from the Connections row in the
                    Action Center to enable approval.
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation */}
            <label className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2.5">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(Boolean(c))}
                disabled={blocked || writeBlocked}
                className="mt-0.5"
              />
              <span className="text-[11px] leading-snug">
                I&apos;ve reviewed the change and approve submitting it to{" "}
                {PLATFORM_LABEL[draft.platform]}. This action will be logged
                in the Action Log under my account.
              </span>
            </label>
          </div>
        )}

        {submitState !== "submitted" && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={closePreview}
              className="h-8 text-[11px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-8 text-[11px]"
            >
              {submitState === "submitting" ? "Submitting…" : "Approve and submit"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
