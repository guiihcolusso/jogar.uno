import type { Metadata } from 'next'

import { AppShell } from '@/shared/layout'

import { Providers } from './providers'

import '@/shared/theme/globals.css'

export const metadata: Metadata = {
  title: 'UNO',
  description: 'Real-time multiplayer UNO',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`h-full min-h-screen antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
