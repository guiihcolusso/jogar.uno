'use client'

import { useContext } from 'react'

import { SocketContext, type SocketContextValue } from '../providers/socket.provider'

/** Raw transport access (`emit`/`on`) — most screens want `useGameSession` instead. */
export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }

  return context
}
