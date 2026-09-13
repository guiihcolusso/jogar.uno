import { clientHttp, unwrap } from '@/shared/http'
import type { GetGamesResponse } from '@/shared/socket'

export async function listGames() {
  const response = await clientHttp.get<GetGamesResponse>('/games')
  return unwrap(response).games
}
