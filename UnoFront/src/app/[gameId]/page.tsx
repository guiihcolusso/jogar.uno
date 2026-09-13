import type { Metadata } from 'next'

import { RoomScreen } from '@/modules/room'

export type RoomPageParams = {
  params: Promise<{ gameId: string }>
}

export const metadata: Metadata = {
  title: 'UNO — Room',
}

export default async function RoomPage({ params }: RoomPageParams) {
  const { gameId } = await params

  return <RoomScreen gameId={gameId} />
}
