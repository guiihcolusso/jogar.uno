import type { Metadata } from 'next'

import { DashboardScreen } from '@/modules/dashboard'

export const metadata: Metadata = {
  title: 'UNO — Games',
  description: 'Browse open UNO tables or start a new one.',
}

export default function DashboardPage() {
  return <DashboardScreen />
}
