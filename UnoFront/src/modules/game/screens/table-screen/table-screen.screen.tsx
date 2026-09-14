'use client'

import { useRef } from 'react'

import { Spinner } from '@heroui/react'

import {
  ColorPickerModal,
  DiscardPile,
  GameChat,
  LeaveGameButton,
  PlayerHand,
  PlayerSeat,
  RoundTimer,
  WinScreenModal,
  ModMenu,
} from '../../components'
import { useTable } from '../../hooks'
import { getLayoutedPlayers, type TableSeatPosition } from '../../utils/table-layout.util'
import { styles } from './table-screen.styles'
import type { TableScreenParams } from './table-screen.types'

const OPPONENT_POSITIONS: TableSeatPosition[] = [
  'topLeft',
  'top',
  'topRight',
  'left',
  'right',
  'bottomLeft',
  'bottomRight',
]

export const TableScreen = ({ gameId }: TableScreenParams) => {
  const pileRef = useRef<HTMLDivElement>(null)

  const {
    loading,
    game,
    currentPlayer,
    chat,
    gameRoundRemainingTimeInSeconds,
    win,
    isColorPickerOpen,
    isDropTarget,
    setIsDropTarget,
    handlePlayCards,
    handleColorSelected,
    handlePlayAgain,
    handleQuit,
    handleLeaveGame,
    handleBuyCard,
    handleGoOnline,
    handleSendMessage,
  } = useTable({ gameId })

  if (loading || !game) {
    return (
      <div className={styles.loading()}>
        <Spinner size="lg" />
      </div>
    )
  }

  const layoutedPlayers = getLayoutedPlayers(game.players, currentPlayer?.id)
  const currentRoundPlayer = game.players[game.currentPlayerIndex]

  return (
    <div className={styles.screen()}>
      <RoundTimer
        remainingSeconds={gameRoundRemainingTimeInSeconds}
        maxSeconds={game.maxRoundDurationInSeconds}
        currentPlayerName={currentRoundPlayer?.name}
      />

      <LeaveGameButton onConfirm={handleLeaveGame} />
      <GameChat chat={chat} currentPlayerId={currentPlayer?.id ?? ''} onSendMessage={handleSendMessage} />

      <div className={styles.table()}>
        {OPPONENT_POSITIONS.map((position) => (
          <PlayerSeat key={position} position={position} player={layoutedPlayers[position]} />
        ))}

        {!currentPlayer && <PlayerSeat position="bottom" player={layoutedPlayers.bottom} />}

        <div className={styles.center()}>
          <DiscardPile
            cards={game.usedCards}
            amountToBuy={game.currentCardCombo.amountToBuy}
            canBuyCard={!!currentPlayer?.canBuyCard}
            onBuyCard={handleBuyCard}
            pileRef={pileRef}
            isDropTarget={isDropTarget}
          />
        </div>
      </div>

      {currentPlayer && (
        <PlayerHand
          player={currentPlayer}
          pileRef={pileRef}
          onPlayCards={handlePlayCards}
          onGoOnline={handleGoOnline}
          onDropTargetChange={setIsDropTarget}
        />
      )}

      <ColorPickerModal isOpen={isColorPickerOpen} onSelect={handleColorSelected} />

      {win && (
        <WinScreenModal
          isOpen
          winnerName={win.winnerName}
          isCurrentPlayer={win.isCurrentPlayer}
          isWaitingForNewGame={win.isWaitingForNewGame}
          onPlayAgain={handlePlayAgain}
          onQuit={handleQuit}
        />
      )}

      <ModMenu gameId={gameId} />
    </div>
  )
}
