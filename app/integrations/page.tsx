"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Database, Activity, Clock, Plug, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { shopifyApi, formatCount, type SyncStatusResponse, type ChannelDataStatsResponse, type ChannelAccount } from "@/lib/api/shopify"
import { GoogleSheetsSyncDialog } from "@/components/integrations/google-sheets-sync-dialog"
import { GoogleSheetsImportDialog } from "@/components/integrations/google-sheets-import-dialog"
import { ShopifyConnectDialog } from "@/components/integrations/shopify-connect-dialog"
import { MetaAdsConnectDialog } from "@/components/integrations/meta-ads-connect-dialog"
import { GoogleAdsConnectDialog } from "@/components/integrations/google-ads-connect-dialog"
import { RedditAdsConnectDialog } from "@/components/integrations/reddit-ads-connect-dialog"
import { LinkedInAdsConnectDialog } from "@/components/integrations/linkedin-ads-connect-dialog"
import { TikTokAdsConnectDialog } from "@/components/integrations/tiktok-ads-connect-dialog"
import { AmazonConnectDialog } from "@/components/integrations/amazon-connect-dialog"
import { AmazonAdsConnectDialog } from "@/components/integrations/amazon-ads-connect-dialog"
import { GoogleAnalyticsConnectDialog } from "@/components/integrations/google-analytics-connect-dialog"
import { cn } from "@/lib/utils"

type IntegrationStatus = "connected" | "disconnected" | "needs-attention"

interface Integration {
  id: string
  name: string
  description: string
  status: IntegrationStatus
  category: string[]
  /** Relative-friendly demo string, e.g. "2 minutes ago", "—" */
  lastSync: string
  /** Volume summary, e.g. "1.2M rows imported" */
  dataImported: string
  /** Which Optilytics metrics this integration powers */
  metricsPowered: string[]
  /** Optional note when status is "needs-attention" */
  attentionNote?: string
  isLive?: boolean
  isComingSoon?: boolean
}

const integrations: Integration[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Orders, products, refunds, and customer data — the backbone of contribution-margin and LTV math.",
    status: "disconnected",
    category: ["all", "e-commerce"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Revenue", "CM%", "Refunds", "LTV", "Cohorts"],
    isLive: true,
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Marketplace orders, fulfillment fees, and ASIN-level revenue for brands selling on Amazon.",
    status: "disconnected",
    category: ["all", "e-commerce"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Revenue", "CM%", "Marketplace Fees"],
    isComingSoon: true,
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Spend, impressions, click-through, and creative performance for Facebook and Instagram campaigns.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "ROAS", "CAC", "Creative"],
    isComingSoon: true,
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Search, PMax, Shopping, and YouTube spend with conversion mapping for blended attribution.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "ROAS", "CAC", "Attribution"],
    isComingSoon: true,
  },
  {
    id: "google-sheets-import",
    name: "Google Sheets (Import)",
    description: "Pull COGS, fixed costs, and custom KPIs from your spreadsheets into Optilytics.",
    status: "disconnected",
    category: ["all", "data-management"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["COGS", "Fixed costs", "Custom KPIs"],
    isComingSoon: true,
  },
  {
    id: "google-sheets-export",
    name: "Google Sheets (Export)",
    description: "Sync live dashboard data out to a spreadsheet for board decks or downstream models.",
    status: "disconnected",
    category: ["all", "data-management"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["KPI exports", "Channel exports", "Cohort exports"],
    isComingSoon: true,
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    description: "Trending creative performance and spend for TikTok ad accounts.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "ROAS", "Creative"],
    isComingSoon: true,
  },
  {
    id: "amazon-ads",
    name: "Amazon Ads",
    description: "Sponsored Products, Brands, and Display spend with ACoS and TACoS for Amazon-driven sales.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "ROAS", "ACoS", "TACoS"],
    isComingSoon: true,
  },
  {
    id: "reddit-ads",
    name: "Reddit Ads",
    description: "Community-driven promoted posts and conversion signal for niche audience tests.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "ROAS"],
    isComingSoon: true,
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "B2B audience insights, conversion tracking, and lead gen form data.",
    status: "disconnected",
    category: ["all", "marketing"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Spend", "Leads", "ROAS"],
    isComingSoon: true,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "GA4 sessions, on-site conversion rate, source/medium attribution, and landing page performance.",
    status: "disconnected",
    category: ["all", "analytics"],
    lastSync: "—",
    dataImported: "—",
    metricsPowered: ["Sessions", "Conv. Rate", "Source/Medium", "Landing Pages"],
    isComingSoon: true,
  },
]

const categories = [
  { id: "all", label: "All" },
  { id: "e-commerce", label: "E-commerce" },
  { id: "marketing", label: "Marketing" },
  // Analytics is its own category because GA4 powers a different
  // shape of metrics than ad platforms (sessions, source/medium,
  // on-site conversion) — bundling it under Marketing would muddy
  // what each tab actually represents.
  { id: "analytics", label: "Analytics" },
  { id: "data-management", label: "Data Management" },
]

function IntegrationLogo({ name }: { name: string }) {
  const logoMap: Record<string, { bg: string; icon: React.ReactNode }> = {
    "Google Sheets (Import)": {
      bg: "bg-[#34A853]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="0" />
        </svg>
      ),
    },
    "Google Sheets (Export)": {
      bg: "bg-[#34A853]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="0" />
        </svg>
      ),
    },
    Shopify: {
      bg: "bg-[#7AB55C]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M15.337 3.415c-.03-.19-.19-.29-.32-.29-.13 0-2.56-.19-2.56-.19s-1.7-1.67-1.89-1.86c-.19-.19-.56-.13-.7-.1l-.96.26c-.58-1.66-1.6-3.19-3.39-3.19h-.16C5.017-2.375 4.557-2.565 4.137-2.565c-4.19 0-6.2 5.23-6.83 7.89l-2.94.91c-.91.29-1 .32-1.06 1.18-.06.67-2.46 18.94-2.46 18.94l18.48 3.18 10.01-2.46s-4.35-23.32-4.38-23.51zM11.287.925l-1.54.48c0-.93-.13-2.24-.54-3.36 1.35.26 2.01 1.76 2.08 2.88zm-2.6.8l-3.32 1.03c.32-1.24 1.1-2.46 2.01-3.26.35-.29.83-.61 1.38-.8-.37.91-.51 2.18-.07 3.03zm-1.67-3.75c.45 0 .83.1 1.15.32-1.28.61-2.62 2.14-3.2 5.2l-2.62.8c.73-2.49 2.46-6.32 4.67-6.32z" />
        </svg>
      ),
    },
    "Meta Ads": {
      bg: "bg-[#0668E1]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.78-3.92 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
        </svg>
      ),
    },
    "Google Ads": {
      bg: "bg-[#4285F4]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
        </svg>
      ),
    },
    "Reddit Ads": {
      bg: "bg-[#FF4500]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
    },
    "LinkedIn Ads": {
      bg: "bg-[#0A66C2]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    "TikTok Ads": {
      bg: "bg-foreground",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-background" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    Amazon: {
      // Amazon's storefront uses the smile-mark monogram on a navy
      // background — keeping it close to Amazon's own visual language
      // makes the card instantly recognizable in a grid of logos.
      bg: "bg-[#232F3E]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#FF9900]" fill="currentColor" aria-hidden>
          <path d="M14.464 14.83c-1.232 1.62-3.05 2.486-4.628 2.486-2.18 0-4.13-1.218-4.13-3.708 0-1.943 1.063-3.27 2.572-3.918 1.31-.575 3.137-.679 4.535-.84v-.16c0-.575.045-1.252-.296-1.748-.298-.444-.864-.628-1.366-.628-.929 0-1.756.479-1.957 1.466-.04.22-.2.435-.42.445L6.65 7.95c-.183-.04-.385-.187-.334-.467.526-2.781 3.04-3.62 5.29-3.62 1.151 0 2.656.307 3.563 1.18 1.151 1.077 1.04 2.515 1.04 4.08v3.694c0 1.111.461 1.598.894 2.197.152.213.186.469-.008.628-.484.405-1.346 1.156-1.819 1.578a.524.524 0 0 1-.6.057zm-.65-3.864c0 .87.022 1.595-.418 2.367-.355.628-.92 1.014-1.547 1.014-.857 0-1.357-.652-1.357-1.617 0-1.901 1.704-2.247 3.322-2.247v.483zM21.6 19.16C19.234 20.91 15.79 22 12.806 22 8.62 22 4.85 20.456 1.999 17.886c-.224-.202-.024-.477.244-.32 3.072 1.787 6.87 2.864 10.793 2.864 2.65 0 5.566-.55 8.246-1.687.404-.171.74.265.318.557zm.99-1.13c-.302-.387-2.005-.184-2.768-.092-.232.027-.268-.174-.058-.32 1.355-.953 3.582-.679 3.844-.359.262.32-.07 2.553-1.347 3.62-.194.158-.378.075-.293-.137.282-.706.913-2.328.622-2.712z"/>
        </svg>
      ),
    },
    "Amazon Ads": {
      // Amazon Ads gets the orange smile mark on the dark navy ground
      // — same family as the storefront mark but inverted, mirroring
      // how Amazon themselves separate their advertising sub-brand.
      bg: "bg-[#232F3E]",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#FF9900]" fill="currentColor" aria-hidden>
          <path d="M14.464 14.83c-1.232 1.62-3.05 2.486-4.628 2.486-2.18 0-4.13-1.218-4.13-3.708 0-1.943 1.063-3.27 2.572-3.918 1.31-.575 3.137-.679 4.535-.84v-.16c0-.575.045-1.252-.296-1.748-.298-.444-.864-.628-1.366-.628-.929 0-1.756.479-1.957 1.466-.04.22-.2.435-.42.445L6.65 7.95c-.183-.04-.385-.187-.334-.467.526-2.781 3.04-3.62 5.29-3.62 1.151 0 2.656.307 3.563 1.18 1.151 1.077 1.04 2.515 1.04 4.08v3.694c0 1.111.461 1.598.894 2.197.152.213.186.469-.008.628-.484.405-1.346 1.156-1.819 1.578a.524.524 0 0 1-.6.057zm-.65-3.864c0 .87.022 1.595-.418 2.367-.355.628-.92 1.014-1.547 1.014-.857 0-1.357-.652-1.357-1.617 0-1.901 1.704-2.247 3.322-2.247v.483zM21.6 19.16C19.234 20.91 15.79 22 12.806 22 8.62 22 4.85 20.456 1.999 17.886c-.224-.202-.024-.477.244-.32 3.072 1.787 6.87 2.864 10.793 2.864 2.65 0 5.566-.55 8.246-1.687.404-.171.74.265.318.557zm.99-1.13c-.302-.387-2.005-.184-2.768-.092-.232.027-.268-.174-.058-.32 1.355-.953 3.582-.679 3.844-.359.262.32-.07 2.553-1.347 3.62-.194.158-.378.075-.293-.137.282-.706.913-2.328.622-2.712z"/>
        </svg>
      ),
    },
    "Google Analytics": {
      // GA4's brand uses the orange/amber bar-chart mark — kept on a
      // white ground so it reads as Google-family without being
      // confused for the blue Google Ads tile next to it.
      bg: "bg-white border border-border",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path
            d="M22.84 2.998v17.999a2.983 2.983 0 0 1-3.04 3.001c-1.661 0-2.96-1.273-2.96-3V3.12c0-1.711 1.276-3.119 2.96-3.119A2.983 2.983 0 0 1 22.84 3z"
            fill="#F9AB00"
          />
          <path
            d="M12 9.001a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-9 6A3 3 0 1 0 3 21a3 3 0 0 0 0-5.999z"
            fill="#E37400"
          />
        </svg>
      ),
    },
  }

  const config = logoMap[name] || { bg: "bg-muted", icon: null }

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
      {config.icon}
    </div>
  )
}

function StatusPill({ status }: { status: IntegrationStatus }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Connected
      </span>
    )
  }
  if (status === "needs-attention") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
        <AlertCircle className="h-3 w-3" />
        Needs attention
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Not connected
    </span>
  )
}

function IntegrationCard({
  integration,
  onAction,
  isLoading = false,
  onSyncNow,
  isSyncing = false,
  accountInfo,
}: {
  integration: Integration
  onAction: (id: string) => void
  isLoading?: boolean
  onSyncNow?: () => void
  isSyncing?: boolean
  accountInfo?: ChannelAccount
}) {
  const isConnected = integration.status !== "disconnected"

  return (
    <Card className="relative overflow-hidden">
      {/* Loading overlay while we fetch Shopify status */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/70 backdrop-blur-[2px]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <IntegrationLogo name={integration.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{integration.name}</h3>
              {integration.isLive && (
                <Badge
                  variant="outline"
                  className="border-emerald-500 bg-emerald-500/10 px-1.5 py-0 text-[9px] text-emerald-600"
                >
                  LIVE
                </Badge>
              )}
              {integration.isComingSoon && !integration.isLive && (
                <Badge
                  variant="outline"
                  className="border-border bg-muted px-1.5 py-0 text-[9px] text-muted-foreground"
                >
                  COMING SOON
                </Badge>
              )}
              <StatusPill status={integration.status} />
            </div>
            {accountInfo?.accountName && (
              <p className="mt-1 text-xs font-medium text-emerald-600 truncate">
                {accountInfo.accountUrl
                  ? <a href={accountInfo.accountUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{accountInfo.accountName}</a>
                  : accountInfo.accountName}
              </p>
            )}
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {integration.description}
            </p>
          </div>
        </div>

        {integration.attentionNote && (
          <div className="flex items-start gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[11px] text-amber-700">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{integration.attentionNote}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/30 p-2.5 text-[11px]">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last sync
            </div>
            <div
              className={cn(
                "mt-0.5 font-medium",
                integration.status === "needs-attention"
                  ? "text-amber-600"
                  : "text-foreground",
              )}
            >
              {integration.lastSync}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Database className="h-3 w-3" />
              Data imported
            </div>
            <div className="mt-0.5 font-medium text-foreground">
              {integration.dataImported}
            </div>
          </div>
        </div>

        {/* Metrics powered — only shown when connected */}
        {isConnected && (
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="h-3 w-3" />
              Metrics powered
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {integration.metricsPowered.map((m) => (
                <span
                  key={m}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="mt-auto flex items-center justify-between pt-1">
          {/* Sync Now — only available when connected and a callback is provided */}
          {isConnected && onSyncNow ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing…" : "Sync now"}
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={() => onAction(integration.id)}
            disabled={integration.isComingSoon}
          >
            {integration.status === "connected" && "Manage"}
            {integration.status === "needs-attention" && "Resolve"}
            {integration.status === "disconnected" && (integration.isComingSoon ? "Coming soon" : "Connect")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—"
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

function formatShopifyImportedData(stats: ChannelDataStatsResponse | null): string {
  if (!stats) return "—"
  const parts = [
    `${formatCount(stats.ordersCount)} orders`,
    `${formatCount(stats.customersCount)} customers`,
    `${formatCount(stats.productsCount)} products`,
  ]
  return parts.join(" · ")
}

function resolveShopifyLastSync(
  statuses: SyncStatusResponse[] | null,
  stats: ChannelDataStatsResponse | null,
): string {
  const candidates = [
    stats?.lastIncrementalSyncAt ?? null,
    statuses?.find((status) => status.lastIncrementalSyncAt)?.lastIncrementalSyncAt ?? null,
    stats?.backfillThrough ?? null,
  ].filter((value): value is string => Boolean(value))

  const best = candidates.sort(
    (left, right) => new Date(right).getTime() - new Date(left).getTime(),
  )[0] ?? null
  return formatRelativeTime(best)
}

function deriveShopifyIntegration(
  base: Integration,
  shopifyStatusLoading: boolean,
  statuses: SyncStatusResponse[] | null,
  stats: ChannelDataStatsResponse | null,
): Integration {
  if (shopifyStatusLoading) return base
  if (!statuses && !stats) {
    return { ...base, status: "disconnected", lastSync: "—", dataImported: "—", attentionNote: undefined }
  }

  const normalizedStatuses = statuses ?? []
  const hasFailure = normalizedStatuses.some((status) => status.status?.toUpperCase() === "FAILED")
  const hasRunning = normalizedStatuses.some((status) =>
    ["RUNNING", "QUEUED", "STARTED"].includes(status.status?.toUpperCase() ?? ""),
  )

  return {
    ...base,
    status: hasFailure ? "needs-attention" : "connected",
    lastSync: hasRunning ? "Sync in progress" : resolveShopifyLastSync(normalizedStatuses, stats),
    dataImported: formatShopifyImportedData(stats),
    attentionNote: hasFailure
      ? `Latest sync failed${normalizedStatuses[0]?.failureSource ? ` (${normalizedStatuses[0].failureSource.toLowerCase()})` : ""}. Reconnect or re-run sync.`
      : undefined,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { user } = useAuth()

  // ── Channel account info (connected store/ad account names) ─────────────
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([])

  useEffect(() => {
    if (!user?.orgUuid) return
    shopifyApi.getChannelAccounts(user.orgUuid)
      .then((data) => setChannelAccounts(data))
      .catch(() => setChannelAccounts([]))
  }, [user?.orgUuid])

  // ── Shopify live status + data stats ────────────────────────────────────
  const [shopifyStatusLoading, setShopifyStatusLoading] = useState(true)
  const [shopifySyncData, setShopifySyncData] = useState<SyncStatusResponse[] | null>(null)
  const [shopifyDataStats, setShopifyDataStats] = useState<ChannelDataStatsResponse | null>(null)
  const [shopifySyncing, setShopifySyncing] = useState(false)

  const fetchShopifyStatus = useCallback(() => {
    if (!user?.orgUuid) return
    shopifyApi
      .getSyncStatus(user.orgUuid)
      .then((data) => setShopifySyncData(data))
      .catch(() => setShopifySyncData(null))
    shopifyApi
      .getDataStats(user.orgUuid)
      .then((data) => setShopifyDataStats(data))
      .catch(() => setShopifyDataStats(null))
  }, [user?.orgUuid])

  useEffect(() => {
    if (!user?.orgUuid) {
      setShopifyStatusLoading(false)
      return
    }
    Promise.allSettled([
      shopifyApi.getSyncStatus(user.orgUuid),
      shopifyApi.getDataStats(user.orgUuid),
    ]).then(([syncResult, statsResult]) => {
      setShopifySyncData(syncResult.status === 'fulfilled' ? syncResult.value : null)
      setShopifyDataStats(statsResult.status === 'fulfilled' ? statsResult.value : null)
    }).finally(() => setShopifyStatusLoading(false))
  }, [user?.orgUuid])

  const handleShopifySyncNow = useCallback(async () => {
    if (!user?.orgUuid || shopifySyncing) return
    setShopifySyncing(true)
    try {
      await shopifyApi.triggerSync(user.orgUuid)
      // Refresh the status so lastSync label updates immediately
      fetchShopifyStatus()
    } catch {
      // Sync failed — swallow silently; user can retry
    } finally {
      setShopifySyncing(false)
    }
  }, [user?.orgUuid, shopifySyncing, fetchShopifyStatus])

  // ── Dialog open/close state ──────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("all")
  const [googleSheetsImportDialogOpen, setGoogleSheetsImportDialogOpen] = useState(false)
  const [googleSheetsExportDialogOpen, setGoogleSheetsExportDialogOpen] = useState(false)
  const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false)
  const [metaAdsDialogOpen, setMetaAdsDialogOpen] = useState(false)
  const [googleAdsDialogOpen, setGoogleAdsDialogOpen] = useState(false)
  const [redditAdsDialogOpen, setRedditAdsDialogOpen] = useState(false)
  const [linkedInAdsDialogOpen, setLinkedInAdsDialogOpen] = useState(false)
  const [tikTokAdsDialogOpen, setTikTokAdsDialogOpen] = useState(false)
  const [amazonDialogOpen, setAmazonDialogOpen] = useState(false)
  const [amazonAdsDialogOpen, setAmazonAdsDialogOpen] = useState(false)
  const [googleAnalyticsDialogOpen, setGoogleAnalyticsDialogOpen] = useState(false)

  // ── Merge live Shopify data into the integrations list ───────────────────
  const liveIntegrations = useMemo<Integration[]>(() => {
    return integrations.map((integration) => {
      if (integration.id !== "shopify") return integration
      return deriveShopifyIntegration(integration, shopifyStatusLoading, shopifySyncData, shopifyDataStats)
    })
  }, [shopifyStatusLoading, shopifySyncData, shopifyDataStats])

  // ── Summary counts (react to live data) ─────────────────────────────────
  const summary = useMemo(() => {
    const connected = liveIntegrations.filter((i) => i.status === "connected").length
    const attention = liveIntegrations.filter((i) => i.status === "needs-attention").length
    const available = liveIntegrations.filter((i) => i.status === "disconnected").length
    // Find the most recent sync among connected integrations — for now just use shopify
    const lastSyncLabel = resolveShopifyLastSync(shopifySyncData, shopifyDataStats)
    return { connected, attention, available, total: liveIntegrations.length, lastSyncLabel }
  }, [liveIntegrations, shopifySyncData, shopifyDataStats])

  const handleAction = (integrationId: string) => {
    if (integrationId === "google-sheets-import") setGoogleSheetsImportDialogOpen(true)
    else if (integrationId === "google-sheets-export") setGoogleSheetsExportDialogOpen(true)
    else if (integrationId === "shopify") setShopifyDialogOpen(true)
    else if (integrationId === "meta-ads") setMetaAdsDialogOpen(true)
    else if (integrationId === "google-ads") setGoogleAdsDialogOpen(true)
    else if (integrationId === "reddit-ads") setRedditAdsDialogOpen(true)
    else if (integrationId === "linkedin-ads") setLinkedInAdsDialogOpen(true)
    else if (integrationId === "tiktok-ads") setTikTokAdsDialogOpen(true)
    else if (integrationId === "amazon") setAmazonDialogOpen(true)
    else if (integrationId === "amazon-ads") setAmazonAdsDialogOpen(true)
    else if (integrationId === "google-analytics") setGoogleAnalyticsDialogOpen(true)
  }

  const filteredIntegrations = liveIntegrations.filter(
    (integration) => activeCategory === "all" || integration.category.includes(activeCategory),
  )

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-3xl">Integrations</h1>
        <p className="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">
          Setup center for the data sources that power Optilytics. Review status, last sync, data
          volume, and which metrics each connection drives.
        </p>
      </div>

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:grid-cols-4">
        <SummaryStat
          icon={Plug}
          label="Connected"
          value={`${summary.connected} of ${summary.total}`}
          tone="positive"
        />
        <SummaryStat
          icon={AlertCircle}
          label="Need attention"
          value={String(summary.attention)}
          tone={summary.attention > 0 ? "warning" : "neutral"}
        />
        <SummaryStat
          icon={Plug}
          label="Available"
          value={String(summary.available)}
          tone="neutral"
        />
        <SummaryStat
          icon={Activity}
          label="Last sync"
          value={summary.lastSyncLabel}
          tone="neutral"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-4 md:mb-6">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="px-2 text-xs md:px-4 md:text-sm"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onAction={handleAction}
            isLoading={integration.id === "shopify" && shopifyStatusLoading}
            onSyncNow={integration.id === "shopify" ? handleShopifySyncNow : undefined}
            isSyncing={integration.id === "shopify" && shopifySyncing}
            accountInfo={channelAccounts.find((a) => a.channelKey === integration.id || a.channelKey === integration.id.replace('-ads', ''))}
          />
        ))}
      </div>

      <GoogleSheetsImportDialog
        open={googleSheetsImportDialogOpen}
        onOpenChange={setGoogleSheetsImportDialogOpen}
      />
      <GoogleSheetsSyncDialog
        open={googleSheetsExportDialogOpen}
        onOpenChange={setGoogleSheetsExportDialogOpen}
      />
      <ShopifyConnectDialog
        open={shopifyDialogOpen}
        onOpenChange={setShopifyDialogOpen}
        onConnected={fetchShopifyStatus}
      />
      <MetaAdsConnectDialog open={metaAdsDialogOpen} onOpenChange={setMetaAdsDialogOpen} />
      <GoogleAdsConnectDialog open={googleAdsDialogOpen} onOpenChange={setGoogleAdsDialogOpen} />
      <RedditAdsConnectDialog open={redditAdsDialogOpen} onOpenChange={setRedditAdsDialogOpen} />
      <LinkedInAdsConnectDialog open={linkedInAdsDialogOpen} onOpenChange={setLinkedInAdsDialogOpen} />
      <TikTokAdsConnectDialog open={tikTokAdsDialogOpen} onOpenChange={setTikTokAdsDialogOpen} />
      <AmazonConnectDialog open={amazonDialogOpen} onOpenChange={setAmazonDialogOpen} />
      <AmazonAdsConnectDialog
        open={amazonAdsDialogOpen}
        onOpenChange={setAmazonAdsDialogOpen}
      />
      <GoogleAnalyticsConnectDialog
        open={googleAnalyticsDialogOpen}
        onOpenChange={setGoogleAnalyticsDialogOpen}
      />
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Plug
  label: string
  value: string
  tone: "positive" | "warning" | "neutral"
}) {
  const toneClass = {
    positive: "text-emerald-600",
    warning: "text-amber-600",
    neutral: "text-foreground",
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("mt-1 text-lg font-semibold", toneClass)}>{value}</div>
    </div>
  )
}
