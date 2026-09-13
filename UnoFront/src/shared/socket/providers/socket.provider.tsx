'use client'

import { createContext, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from '@heroui/react'

import { useLocale } from '@/shared/i18n'

import type { SocketClientEventMap, SocketClientEvents, SocketServerEvent } from '../socket.types'
import { socketClient } from '../socket-client'

export type SocketContextValue = {
  connected: boolean
  emit: <Event extends SocketServerEvent>(
    event: Event,
    data: SocketClientEventMap[Event]['input'],
  ) => Promise<SocketClientEventMap[Event]['response']>
  on: <Data>(event: SocketClientEvents, handler: (data: Data) => void | Promise<void>) => () => void
}

export const SocketContext = createContext<SocketContextValue | null>(null)

export type SocketProviderParams = {
  children: ReactNode
}

/**
 * Low-level transport provider — connects the singleton socket.io client and
 * exposes a typed `emit`/`on` pair through context. Domain state (current
 * player, active game, chat) lives one level up in `GameSessionProvider`.
 */
export const SocketProvider = ({ children }: SocketProviderParams) => {
  const { reconnecting, reconnected } = useLocale('socket')
  const [connected, setConnected] = useState(false)
  const hasDisconnectedBefore = useRef(false)

  useEffect(() => {
    socketClient.connect()

    const offConnect = socketClient.on('connect', () => setConnected(true))
    const offDisconnect = socketClient.on('disconnect', () => setConnected(false))

    return () => {
      offConnect()
      offDisconnect()
    }
  }, [])

  useEffect(() => {
    if (!connected) {
      hasDisconnectedBefore.current = true
      toast.danger(reconnecting)
      return
    }

    if (hasDisconnectedBefore.current) {
      toast.success(reconnected)
    }
  }, [connected, reconnecting, reconnected])

  const value = useMemo<SocketContextValue>(
    () => ({
      connected,
      emit: (event, data) => socketClient.emit(event, data),
      on: (event, handler) => socketClient.on(event, handler),
    }),
    [connected],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
