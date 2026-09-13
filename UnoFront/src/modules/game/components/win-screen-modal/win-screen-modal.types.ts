export type WinScreenModalParams = {
  isOpen: boolean
  winnerName: string
  isCurrentPlayer: boolean
  isWaitingForNewGame: boolean
  onPlayAgain: () => void
  onQuit: () => void
}
