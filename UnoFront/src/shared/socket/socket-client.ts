import { io,type Socket } from 'socket.io-client'

import { env } from '@/config/env'

import type { SocketClientEventMap, SocketClientEvents, SocketServerEvent } from './socket.types'

/**
 * Thin wrapper around a single `socket.io-client` v4 connection.
 *
 * Plain JSON (no msgpack — the old CRA client used `socket.io-msgpack-parser`,
 * dropped per the new backend/frontend contract). Ack-based emits are wrapped
 * in a Promise so call sites read like normal async functions instead of
 * threading callbacks everywhere.
 */
class SocketClient {
  private static instance: Socket | null = null

  get client(): Socket {
    if (!SocketClient.instance) {
      SocketClient.instance = io(env.NEXT_PUBLIC_SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        autoConnect: false,
      })
    }

    return SocketClient.instance
  }

  connect(): void {
    if (!this.client.connected) {
      this.client.connect()
    }
  }

  async emit<Event extends SocketServerEvent>(
    event: Event,
    data: SocketClientEventMap[Event]['input'],
  ): Promise<SocketClientEventMap[Event]['response']> {
    return await new Promise((resolve, reject) => {
      this.client.emit(
        event,
        data,
        (response: SocketClientEventMap[Event]['response'] | { error?: string }) => {
          if (response && typeof response === 'object' && 'error' in response && response.error) {
            reject(new Error(String(response.error)))
            return
          }

          resolve(response as SocketClientEventMap[Event]['response'])
        },
      )
    })
  }

  on<Data>(event: SocketClientEvents, handler: (data: Data) => void | Promise<void>): () => void {
    const wrapped = async (data: Data) => {
      try {
        await handler(data)
      } catch (error) {
         
        console.error(`[socket] handler for "${event}" failed`, error)
      }
    }

    this.client.on(event, wrapped)

    return () => {
      this.client.off(event, wrapped)
    }
  }
}

export const socketClient = new SocketClient()
