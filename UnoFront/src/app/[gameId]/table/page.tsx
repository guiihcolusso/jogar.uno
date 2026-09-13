import type { Metadata } from 'next'

import { TableScreen } from '@/modules/game'

export type TablePageParams = {
  params: Promise<{ gameId: string }>
}

export const metadata: Metadata = {
  title: 'UNO — Table',
}

export default async function TablePage({ params }: TablePageParams) {
  const { gameId } = await params

  return <TableScreen gameId={gameId} />
}
