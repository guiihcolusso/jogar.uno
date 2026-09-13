'use client'

import { useEffect } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { GameListUpdatedEventData } from '@/shared/socket'
import { useSocket } from '@/shared/socket'

import { DASHBOARD_QUERY_KEYS } from '../constants'
import { listGames } from '../services'

/**
 * Game list for the dashboard — refetched on `GameListUpdated`, the
 * server's empty-payload signal that something in the lobby list changed
 * (a game was created, filled up, or ended).
 */
export const useGames = () => {
  const queryClient = useQueryClient()
  const { on } = useSocket()

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.games,
    queryFn: listGames,
  })

  useEffect(() => {
    return on<GameListUpdatedEventData>('GameListUpdated', () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.games })
    })
  }, [on, queryClient])

  return query
}
