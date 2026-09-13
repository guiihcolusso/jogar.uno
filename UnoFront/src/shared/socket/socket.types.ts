/**
 * Full realtime + REST contract shared with the UNO backend (`UnoAPI`).
 * Kept here (not in a single feature module) because dashboard, room and
 * game modules all depend on the same entities — modules cannot import
 * from each other, so this is the shared source of truth.
 */

// ── Entities ────────────────────────────────────────────────────────────

export type CardColors = 'red' | 'yellow' | 'green' | 'blue' | 'black' | ''

export type CardTypes =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'block'
  | 'reverse'
  | 'buy-2'
  | 'buy-4'
  | 'change-color'

export type CardData = {
  id: string
  name: string
  src: string
  type: CardTypes
  color: CardColors
  canBeUsed?: boolean
  canBeCombed?: boolean
}

export type GameStatus = 'waiting' | 'playing' | 'ended'

export type PlayerStatus = 'online' | 'offline' | 'afk'

/** Effect broadcast about a player (draw cards / skipped / one card left). */
export type PlayerState = 'BuyCards' | 'Blocked' | 'Uno'

/** Guest identity — no real auth, just a client-generated id + a display name. */
export type Player = {
  id: string
  name: string
}

export type PlayerData = Player & {
  ready: boolean
  status: PlayerStatus
  handCards: CardData[]
  isCurrentRoundPlayer: boolean
  canBuyCard: boolean
}

export type CurrentCardCombo = {
  amountToBuy: number
}

export type Game = {
  id: string
  title: string
  status: GameStatus
  maxPlayers: number
  maxRoundDurationInSeconds: number
  currentPlayerIndex: number
  players: PlayerData[]
  usedCards: CardData[]
  currentCardCombo: CurrentCardCombo
  chatId: string
  createdAt: number
}

export type ChatMessage = {
  id: string
  playerId: string
  playerName: string
  content: string
  createdAt: number
}

export type Chat = {
  id: string
  messages: ChatMessage[]
}

export type GameHistory = {
  id: string
  message: string
  createdAt: number
}

// ── Client → Server (ack-based) ──────────────────────────────────────────

export type SetPlayerDataEventInput = { player: Player }
export type SetPlayerDataEventResponse = { player: Player }

export type CreateGameEventInput = Record<string, never>
export type CreateGameEventResponse = { gameId: string }

export type JoinGameEventInput = { gameId: string }
export type JoinGameEventResponse = { game: Game; chat: Chat }

export type BuyCardEventInput = { gameId: string }

export type PutCardEventInput = { gameId: string; cardIds: string[]; selectedColor: CardColors }

export type SendChatMessageEventInput = { chatId: string; message: string }

export type ChangePlayerStatusEventInput = { gameId: string; playerStatus: PlayerStatus }

export type ToggleReadyEventInput = { gameId: string }

export type ForceSelfDisconnectEventInput = { gameId: string }

export type SocketClientEventMap = {
  SetPlayerData: { input: SetPlayerDataEventInput; response: SetPlayerDataEventResponse }
  CreateGame: { input: CreateGameEventInput; response: CreateGameEventResponse }
  JoinGame: { input: JoinGameEventInput; response: JoinGameEventResponse }
  BuyCard: { input: BuyCardEventInput; response: unknown }
  PutCard: { input: PutCardEventInput; response: unknown }
  SendChatMessage: { input: SendChatMessageEventInput; response: unknown }
  ChangePlayerStatus: { input: ChangePlayerStatusEventInput; response: unknown }
  ToggleReady: { input: ToggleReadyEventInput; response: unknown }
  ForceSelfDisconnect: { input: ForceSelfDisconnectEventInput; response: unknown }
}

export type SocketServerEvent = keyof SocketClientEventMap

// ── Server → Client (broadcast) ──────────────────────────────────────────

export type PlayerJoinedEventData = { player: PlayerData }
export type PlayerLeftEventData = { playerId: string }
export type PlayerToggledReadyEventData = { playerId: string; ready: boolean }
export type PlayerBoughtCardEventData = { playerId: string; cards: CardData[] }
export type PlayerPutCardEventData = { playerId: string; cards: CardData[] }
export type PlayerChoseCardColorEventData = { cards: CardData[] }
export type PlayerBlockedEventData = { playerId: string }
export type GameAmountToBuyChangedEventData = { amountToBuy: number }
export type PlayerBuyCardsEventData = { playerId: string; amountToBuy: number }
export type PlayerStatusChangedEventData = { playerId: string; status: PlayerStatus }
export type GameStartedEventData = { game: Game }
export type PlayerWonEventData = { player: PlayerData }
export type PlayerUnoEventData = { playerId: string }
export type GameEndedEventData = { game?: Game }
export type GameRoundRemainingTimeChangedEventData = { roundRemainingTimeInSeconds: number }
export type NewMessageEventData = { chatId: string; message: ChatMessage }
export type GameHistoryConsolidatedEventData = { gameHistory: GameHistory[] }
export type GameListUpdatedEventData = Record<string, never>

export type ConsolidatedHandCard = { id: string; canBeUsed: boolean; canBeCombed: boolean }
export type ConsolidatedPlayer = {
  id: string
  isCurrentRoundPlayer: boolean
  canBuyCard: boolean
  handCards: ConsolidatedHandCard[]
}
export type PlayerCardUsabilityConsolidatedEventData = { players: ConsolidatedPlayer[] }

export type SocketClientEvents =
  | 'PlayerJoined'
  | 'PlayerLeft'
  | 'PlayerToggledReady'
  | 'PlayerBoughtCard'
  | 'PlayerPutCard'
  | 'PlayerChoseCardColor'
  | 'PlayerBlocked'
  | 'GameAmountToBuyChanged'
  | 'PlayerBuyCards'
  | 'PlayerStatusChanged'
  | 'GameStarted'
  | 'PlayerWon'
  | 'PlayerUno'
  | 'GameEnded'
  | 'GameRoundRemainingTimeChanged'
  | 'NewMessage'
  | 'GameHistoryConsolidated'
  | 'GameListUpdated'
  | 'PlayerCardUsabilityConsolidated'
  | 'connect'
  | 'disconnect'
  | 'reconnect'

// ── REST ──────────────────────────────────────────────────────────────────

export type GetGamesResponse = { games: Game[] }
export type GetCardsResponse = { cards: CardData[] }
