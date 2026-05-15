import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppShell } from '@/components/app/AppShell'
import { OnboardingController } from '@/components/onboarding/onboarding-controller'
import { Toaster } from '@/components/ui/toaster'
import {
  ApprovedActionsProvider,
  PreviewActionModal,
  ActionLogSheet,
} from '@/components/dashboard/approved-actions'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Oplytics — Ad Analytics',
  description: 'Real-time ad performance analytics across all your channels',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {/*
          AuthProvider must wrap everything so hooks like useAuth()
          work inside AppShell, Sidebar, and page-level components.
        */}
        <AuthProvider>
          {/*
            ApprovedActionsProvider wraps the whole app so the AI
            Assistant (in the sidebar) can open the same Preview Action
            modal instance that the Action Center uses.
          */}
          <ApprovedActionsProvider>
            {/*
              AppShell is a client component that:
              - Renders only children on /login and /register (no sidebar).
              - Redirects to /login when the user is not authenticated.
              - Shows the full dashboard chrome when authenticated.
            */}
            <AppShell>
              {children}
            </AppShell>

            {/* Onboarding & shared modals — only visible when authenticated */}
            <OnboardingController />
            <PreviewActionModal />
            <ActionLogSheet />
            <Toaster />
          </ApprovedActionsProvider>
        </AuthProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
