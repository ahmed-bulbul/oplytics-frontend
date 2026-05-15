import { redirect } from "next/navigation"

// Backwards-compatible redirect: the old /manage route now lives at /action-center.
export default function ManageRedirect() {
  redirect("/action-center")
}
