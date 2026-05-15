"use client"

import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { useSearchParams } from "next/navigation"
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Palette,
  Mail,
  Smartphone,
  Globe,
  Key,
  LogOut,
  Building2,
  Upload,
  Check,
  Calculator,
  Loader2,
  Trash2,
  Camera,
  Save,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react"
import { CalculationSettings } from "@/components/settings/calculation-settings"
import { dispatchReplayOnboarding } from "@/components/onboarding/onboarding-controller"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { ApiError } from "@/lib/api/client"
import { organizationApi, type OrgMemberRow } from "@/lib/api/organization"
import { useToast } from "@/hooks/use-toast"
import { BillingSettingsPanel } from "@/components/billing/BillingSettingsPanel"

const PROFILE_TIMEZONES = [
  { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
]

const PROFILE_CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "BDT", label: "BDT (Tk)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
]

const PROFILE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
]

const PROFILE_DATE_FORMATS = [
  { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
  { value: "mm/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-mm-dd", label: "YYYY-MM-DD" },
]

const SETTINGS_TABS = new Set([
  "business",
  "calculations",
  "profile",
  "notifications",
  "security",
  "billing",
  "team",
])

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  )
}

function SettingsPageInner() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get("tab") ?? "business"
  const initialTab = SETTINGS_TABS.has(requestedTab) ? requestedTab : "business"

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [alertThreshold, setAlertThreshold] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  
  // Business settings
  const [primaryColor, setPrimaryColor] = useState("#10b981")
  const [secondaryColor, setSecondaryColor] = useState("#6366f1")
  const [accentColor, setAccentColor] = useState("#f59e0b")
  const [teamMembers, setTeamMembers] = useState<OrgMemberRow[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [removingUserUuid, setRemovingUserUuid] = useState<string | null>(null)
  const [profileFirstName, setProfileFirstName] = useState("")
  const [profileLastName, setProfileLastName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileTimezone, setProfileTimezone] = useState("Asia/Dhaka")
  const [profileCurrency, setProfileCurrency] = useState("USD")
  const [profileLanguage, setProfileLanguage] = useState("en")
  const [profileDateFormat, setProfileDateFormat] = useState("dd/mm/yyyy")
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const presetColors = [
    { name: "Emerald", value: "#10b981" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Amber", value: "#f59e0b" },
  ]

  useEffect(() => {
    if (!user?.orgUuid) return

    let active = true
    setTeamLoading(true)
    setTeamError(null)

    organizationApi
      .listMembers(user.orgUuid)
      .then((response) => {
        if (!active) return
        setTeamMembers(response.items)
      })
      .catch((error) => {
        if (!active) return
        setTeamError(error instanceof ApiError ? error.message : "Unable to load team members.")
      })
      .finally(() => {
        if (active) setTeamLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.orgUuid])

  useEffect(() => {
    setProfileFirstName(user?.firstName ?? "")
    setProfileLastName(user?.lastName ?? "")
    setProfileEmail(user?.email ?? "")
    setProfilePhone(user?.phone ?? "")
    setProfileTimezone(user?.timezone ?? "Asia/Dhaka")
    setProfileCurrency(user?.currency ?? "USD")
    setProfileLanguage(user?.language ?? "en")
    setProfileDateFormat(user?.dateFormat ?? "dd/mm/yyyy")
    setProfileAvatarUrl(user?.avatarUrl ?? null)
  }, [user])

  async function refreshMembers() {
    if (!user?.orgUuid) return
    const response = await organizationApi.listMembers(user.orgUuid)
    setTeamMembers(response.items)
  }

  async function handleInviteMember() {
    if (!user?.orgUuid) return
    setInviteSubmitting(true)
    setTeamError(null)
    try {
      await organizationApi.addMember(user.orgUuid, {
        email: inviteEmail,
        password: invitePassword,
        role: "MEMBER",
      })
      setInviteEmail("")
      setInvitePassword("")
      await refreshMembers()
    } catch (error) {
      setTeamError(error instanceof ApiError ? error.message : "Unable to add member.")
    } finally {
      setInviteSubmitting(false)
    }
  }

  async function handleRemoveMember(member: OrgMemberRow) {
    if (!user?.orgUuid) return
    setRemovingUserUuid(member.userUuid)
    setTeamError(null)
    try {
      await organizationApi.removeMember(user.orgUuid, member.userUuid)
      await refreshMembers()
    } catch (error) {
      setTeamError(error instanceof ApiError ? error.message : "Unable to remove member.")
    } finally {
      setRemovingUserUuid(null)
    }
  }

  function initialsForMember(email: string) {
    return email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "TM"
  }

  const profileDisplayName = useMemo(() => {
    const fullName = `${profileFirstName} ${profileLastName}`.trim()
    return fullName || profileEmail || "Your profile"
  }, [profileEmail, profileFirstName, profileLastName])

  const profileInitials = useMemo(() => {
    return profileDisplayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  }, [profileDisplayName])

  const profileHasChanges =
    profileFirstName !== (user?.firstName ?? "") ||
    profileLastName !== (user?.lastName ?? "") ||
    profileEmail !== (user?.email ?? "") ||
    profilePhone !== (user?.phone ?? "") ||
    profileTimezone !== (user?.timezone ?? "Asia/Dhaka") ||
    profileCurrency !== (user?.currency ?? "USD") ||
    profileLanguage !== (user?.language ?? "en") ||
    profileDateFormat !== (user?.dateFormat ?? "dd/mm/yyyy") ||
    profileAvatarUrl !== (user?.avatarUrl ?? null)

  function resetProfileForm() {
    setProfileFirstName(user?.firstName ?? "")
    setProfileLastName(user?.lastName ?? "")
    setProfileEmail(user?.email ?? "")
    setProfilePhone(user?.phone ?? "")
    setProfileTimezone(user?.timezone ?? "Asia/Dhaka")
    setProfileCurrency(user?.currency ?? "USD")
    setProfileLanguage(user?.language ?? "en")
    setProfileDateFormat(user?.dateFormat ?? "dd/mm/yyyy")
    setProfileAvatarUrl(user?.avatarUrl ?? null)
    setProfileError(null)
  }

  function handleAvatarSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose a valid image file.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Avatar must be smaller than 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProfileAvatarUrl(typeof reader.result === "string" ? reader.result : null)
      setProfileError(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveProfile() {
    const trimmedEmail = profileEmail.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setProfileError("Please enter a valid email address.")
      return
    }
    if (!profileFirstName.trim()) {
      setProfileError("First name is required.")
      return
    }

    setProfileSaving(true)
    setProfileError(null)
    try {
      await updateProfile({
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        email: trimmedEmail,
        phone: profilePhone.trim(),
        timezone: profileTimezone,
        currency: profileCurrency,
        language: profileLanguage,
        dateFormat: profileDateFormat,
        avatarUrl: profileAvatarUrl,
      })
      toast({
        title: "Profile updated",
        description: "Your profile details and preferences were saved.",
      })
    } catch (error) {
      setProfileError(error instanceof ApiError ? error.message : "Unable to save your profile right now.")
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5 md:text-sm md:mt-1">
          Manage your account preferences and configurations
        </p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-4 md:space-y-6">
        <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="business" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="calculations" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Calculator className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Calculations</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        {/* Calculations Tab */}
        <TabsContent value="calculations" className="space-y-6">
          <CalculationSettings />
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Configure your business details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue="Optilytics Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" defaultValue="https://optilytics.io" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="ecommerce">
                    <SelectTrigger id="industry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="agency">Marketing Agency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select defaultValue="11-50">
                    <SelectTrigger id="companySize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Logo Upload */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Business Logo</h4>
                <div className="flex items-start gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-500">
                      <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload Logo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Recommended size 512x512px.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Brand Colors */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Brand Colors</h4>
                  <p className="text-xs text-muted-foreground mt-1">These colors will be used throughout the dashboard theme</p>
                </div>

                {/* Primary Color */}
                <div className="space-y-3">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg border shadow-sm cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Input 
                      type="text" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-28 font-mono text-sm"
                    />
                    <div className="flex gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setPrimaryColor(color.value)}
                          className="relative h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {primaryColor === color.value && (
                            <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg border shadow-sm cursor-pointer"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <Input 
                      type="text" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-28 font-mono text-sm"
                    />
                    <div className="flex gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSecondaryColor(color.value)}
                          className="relative h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {secondaryColor === color.value && (
                            <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg border shadow-sm cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    />
                    <Input 
                      type="text" 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-28 font-mono text-sm"
                    />
                    <div className="flex gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAccentColor(color.value)}
                          className="relative h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {accentColor === color.value && (
                            <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 pt-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                    <Button style={{ backgroundColor: primaryColor }} className="text-white hover:opacity-90">
                      Primary Button
                    </Button>
                    <Button style={{ backgroundColor: secondaryColor }} className="text-white hover:opacity-90">
                      Secondary
                    </Button>
                    <Button variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
                      Accent
                    </Button>
                    <div className="ml-4 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: secondaryColor }} />
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>
                Walk through the welcome flow again to reconfirm your goals, integrations, or
                calculation settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                Reopens the welcome → connect data → set goals → confirm calculations flow.
                Runs in demo mode and does not change saved settings.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatchReplayOnboarding()}
              >
                Restart onboarding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Keep your identity, locale, and workspace defaults up to date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <Avatar className="h-24 w-24 border border-border shadow-sm">
                      <AvatarImage src={profileAvatarUrl ?? undefined} alt={profileDisplayName} />
                      <AvatarFallback className="bg-emerald-100 text-xl font-semibold text-emerald-700">
                        {profileInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{profileDisplayName}</p>
                        <p className="text-sm text-muted-foreground">{profileEmail || "Add your work email"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Change Avatar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!profileAvatarUrl}
                          onClick={() => setProfileAvatarUrl(null)}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">JPG, PNG, GIF, or WebP. Max 2MB.</p>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelection}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        placeholder="Bulbul"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        placeholder="Ahmed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Profile status
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border bg-background p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Account role</span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          {user?.role ?? "ADMIN"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Admins can manage workspace setup, members, and integrations.
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Locale summary
                      </div>
                      <p className="text-xs text-muted-foreground">
                        These values shape how your dashboard feels across dates, money, and team-facing identity.
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <div className="text-muted-foreground">Timezone</div>
                          <div className="mt-1 font-medium text-foreground">
                            {PROFILE_TIMEZONES.find((item) => item.value === profileTimezone)?.label ?? profileTimezone}
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-3 py-2">
                          <div className="text-muted-foreground">Currency</div>
                          <div className="mt-1 font-medium text-foreground">
                            {PROFILE_CURRENCIES.find((item) => item.value === profileCurrency)?.label ?? profileCurrency}
                          </div>
                        </div>
                      </div>
                    </div>

                    {profileError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {profileError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium">Preferences</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personalize locale defaults so reports and exports feel natural to your workflow.
                  </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profileTimezone} onValueChange={setProfileTimezone}>
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_TIMEZONES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={profileCurrency} onValueChange={setProfileCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_CURRENCIES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={profileLanguage} onValueChange={setProfileLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_LANGUAGES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={profileDateFormat} onValueChange={setProfileDateFormat}>
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_DATE_FORMATS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" disabled={!profileHasChanges || profileSaving} onClick={resetProfileForm}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!profileHasChanges || profileSaving}
                  onClick={() => void handleSaveProfile()}
                >
                  {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive push notifications on mobile</p>
                    </div>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Weekly Performance Report</p>
                      <p className="text-xs text-muted-foreground">Get a summary of your metrics every Monday</p>
                    </div>
                  </div>
                  <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Alert Threshold Notifications</p>
                      <p className="text-xs text-muted-foreground">Get notified when metrics exceed thresholds</p>
                    </div>
                  </div>
                  <Switch checked={alertThreshold} onCheckedChange={setAlertThreshold} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Key className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Change Password</h4>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button variant="outline">Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-sm font-medium">Chrome on MacOS</p>
                          <p className="text-xs text-muted-foreground">San Francisco, CA • Current session</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Safari on iPhone</p>
                          <p className="text-xs text-muted-foreground">San Francisco, CA • 2 days ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <BillingSettingsPanel />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Admins can add members after the workspace is created</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-[1.2fr_1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Member email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="analyst@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-password">Temporary password</Label>
                  <Input
                    id="invite-password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={inviteSubmitting || !inviteEmail || invitePassword.length < 8}
                    onClick={handleInviteMember}
                  >
                    {inviteSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                    Add Member
                  </Button>
                </div>
              </div>

              {teamError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {teamError}
                </div>
              )}

              <div className="space-y-4">
                {teamLoading ? (
                  <div className="flex items-center justify-center rounded-lg border py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading team members…
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                    No members yet. Add your first teammate once Shopify is connected and ready.
                  </div>
                ) : (
                  teamMembers.map((member) => {
                    const isAdmin = member.role === "ADMIN"
                    const isSelf = member.email.toLowerCase() === user?.email?.toLowerCase()

                    return (
                      <div key={member.userUuid} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage alt={member.email} />
                            <AvatarFallback>{initialsForMember(member.email)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {isAdmin ? "Admin" : "Member"}{isSelf ? " • You" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            {isAdmin ? "Admin" : "Member"}
                          </div>
                          {!isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              disabled={removingUserUuid === member.userUuid}
                              onClick={() => handleRemoveMember(member)}
                            >
                              {removingUserUuid === member.userUuid ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
