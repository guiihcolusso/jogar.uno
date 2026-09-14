'use client'

import { useState } from 'react'
import {
  Bomb,
  Crown,
  Edit2,
  Flame,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  User,
  Users,
  Wand2,
  X,
  Zap,
} from 'lucide-react'

import { env } from '@/config/env'
import type { CardColors, CardData, CardTypes } from '@/shared/socket'
import { useGameSession, useSocket } from '@/shared/socket'

import { PlayingCard } from '../playing-card'
import { styles } from './mod-menu.styles'
import type { ModMenuParams } from './mod-menu.types'
import { useModMenuConsole } from './use-mod-menu-console.hook'

const ALL_TYPES: { type: CardTypes; label: string }[] = [
  { type: '0', label: '0' },
  { type: '1', label: '1' },
  { type: '2', label: '2' },
  { type: '3', label: '3' },
  { type: '4', label: '4' },
  { type: '5', label: '5' },
  { type: '6', label: '6' },
  { type: '7', label: '7' },
  { type: '8', label: '8' },
  { type: '9', label: '9' },
  { type: 'block', label: '🚫 Bloqueio' },
  { type: 'reverse', label: '🔄 Inverter' },
  { type: 'buy-2', label: '➕2 Comprar 2' },
  { type: 'buy-4', label: '💥+4 Coringa' },
  { type: 'change-color', label: '🌈 Mudar Cor' },
]

const ALL_COLORS: { color: CardColors; name: string }[] = [
  { color: 'red', name: 'Vermelho' },
  { color: 'blue', name: 'Azul' },
  { color: 'green', name: 'Verde' },
  { color: 'yellow', name: 'Amarelo' },
  { color: 'black', name: 'Coringa (Preto)' },
]

type Tab = 'hand' | 'spawn' | 'table' | 'game'

export const ModMenu = ({ gameId }: ModMenuParams) => {
  const { isOpen, setIsOpen, isUnlocked, toggle } = useModMenuConsole()
  const { currentPlayer, game, setGameData } = useGameSession()
  const { emit } = useSocket()

  const [activeTab, setActiveTab] = useState<Tab>('hand')
  const [targetPlayerId, setTargetPlayerId] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<CardColors>('black')
  const [selectedType, setSelectedType] = useState<CardTypes>('buy-4')
  const [quantity, setQuantity] = useState<number>(1)
  const [statusMsg, setStatusMsg] = useState<string>('')

  // Card editor modal state (for editing an existing card in hand)
  const [editingCard, setEditingCard] = useState<CardData | null>(null)
  const [swapColor, setSwapColor] = useState<CardColors>('black')
  const [swapType, setSwapType] = useState<CardTypes>('buy-4')

  const showStatus = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 3500)
  }

  // Active target player (defaults to currentPlayer if not selected or invalid)
  const players = game?.players ?? []
  const effectiveTargetId = targetPlayerId && players.some((p) => p.id === targetPlayerId)
    ? targetPlayerId
    : currentPlayer?.id ?? players[0]?.id ?? ''
  const targetPlayer = players.find((p) => p.id === effectiveTargetId) ?? currentPlayer
  const isTargetSelf = targetPlayer?.id === currentPlayer?.id

  // ── Cheat Handlers ──────────────────────────────────────────────────────────

  const handleSpawnCustomCard = async (
    type = selectedType,
    color = selectedColor,
    count = quantity,
    forPlayerId = effectiveTargetId,
  ) => {
    const finalColor = type === 'buy-4' || type === 'change-color' ? 'black' : color === 'black' ? 'red' : color
    const targetName = players.find((p) => p.id === forPlayerId)?.name ?? 'Jogador'

    try {
      await emit('CheatAddCards', {
        gameId,
        targetPlayerId: forPlayerId,
        cardType: type,
        cardColor: finalColor,
        count,
      })
      showStatus(`Adicionado ${count}x carta ${type} (${finalColor}) para ${targetName}!`)
    } catch {
      showStatus('Erro ao adicionar carta no servidor.')
    }
  }

  const handleRemoveCard = async (cardId: string, fromPlayerId = effectiveTargetId) => {
    try {
      await emit('CheatRemoveCard', { gameId, targetPlayerId: fromPlayerId, cardId })

      // Optimistic update
      if (game) {
        const nextPlayers = game.players.map((p) =>
          p.id === fromPlayerId ? { ...p, handCards: p.handCards.filter((c) => c.id !== cardId) } : p,
        )
        setGameData({ ...game, players: nextPlayers })
      }
      showStatus('Carta removida!')
    } catch {
      showStatus('Erro ao remover carta.')
    }
  }

  const handleSwapCard = async () => {
    if (!editingCard) return

    const finalColor = swapType === 'buy-4' || swapType === 'change-color' ? 'black' : swapColor === 'black' ? 'red' : swapColor
    const targetName = targetPlayer?.name ?? 'Jogador'

    try {
      await emit('CheatSwapCard', {
        gameId,
        targetPlayerId: effectiveTargetId,
        cardId: editingCard.id,
        newCardType: swapType,
        newCardColor: finalColor,
      })

      showStatus(`Carta de ${targetName} alterada para ${swapType} (${finalColor})!`)
      setEditingCard(null)
    } catch {
      showStatus('Erro ao editar carta.')
    }
  }

  const handleSetHandCount = async (count: number, forPlayerId = effectiveTargetId) => {
    const targetName = players.find((p) => p.id === forPlayerId)?.name ?? 'Jogador'
    try {
      await emit('CheatSetHandCount', { gameId, targetPlayerId: forPlayerId, count })
      showStatus(`Mão de ${targetName} definida para ${count} carta(s)!`)
    } catch {
      showStatus('Erro ao alterar contagem de cartas.')
    }
  }

  const handleInstantWin = async (forPlayerId = effectiveTargetId) => {
    const targetName = players.find((p) => p.id === forPlayerId)?.name ?? 'Jogador'
    try {
      await emit('CheatWinGame', { gameId, targetPlayerId: forPlayerId })
      showStatus(`🏆 Vitória concedida para ${targetName}!`)
      setIsOpen(false)
    } catch {
      showStatus('Erro ao disparar vitória.')
    }
  }

  const handleForceTurn = async (forPlayerId = effectiveTargetId) => {
    const targetName = players.find((p) => p.id === forPlayerId)?.name ?? 'Jogador'
    try {
      await emit('CheatForceTurn', { gameId, targetPlayerId: forPlayerId })
      showStatus(`👑 Vez passada para ${targetName} agora!`)
    } catch {
      showStatus('Erro ao forçar turno.')
    }
  }

  const handleSetTopCard = async (type: CardTypes, color: CardColors) => {
    try {
      await emit('CheatSetTopCard', { gameId, cardType: type, cardColor: color })
      showStatus(`Mesa alterada para ${type} (${color})!`)
    } catch {
      showStatus('Erro ao alterar carta da mesa.')
    }
  }

  // If not unlocked via console, render nothing
  if (!isUnlocked) return null

  // Preview URL for spawner
  const previewColor: CardColors =
    selectedType === 'buy-4' || selectedType === 'change-color'
      ? 'black'
      : selectedColor === 'black'
        ? 'red'
        : selectedColor
  const previewCard: CardData = {
    id: 'preview',
    name: `${selectedType}-${previewColor}`,
    color: previewColor,
    type: selectedType,
    src: `${env.NEXT_PUBLIC_ASSETS_URL}/cards/${selectedType}/${previewColor}.svg`,
  }

  // Swap preview URL
  const swapPreviewColor: CardColors =
    swapType === 'buy-4' || swapType === 'change-color'
      ? 'black'
      : swapColor === 'black'
        ? 'red'
        : swapColor
  const swapPreviewCard: CardData = {
    id: 'swap-preview',
    name: `${swapType}-${swapPreviewColor}`,
    color: swapPreviewColor,
    type: swapType,
    src: `${env.NEXT_PUBLIC_ASSETS_URL}/cards/${swapType}/${swapPreviewColor}.svg`,
  }

  const targetHandCards = targetPlayer?.handCards ?? []
  const topDiscardCard = game?.usedCards?.[0]

  return (
    <>
      {/* Floating trigger button to toggle the menu once unlocked */}
      <button type="button" onClick={toggle} className={styles.floatingTrigger()} title="Abrir UNO Mod Menu">
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
        <span>MOD MENU</span>
      </button>

      {/* Main Mod Menu Panel */}
      {isOpen && (
        <div className={styles.backdrop()} onClick={() => setIsOpen(false)}>
          <div className={styles.panel()} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.header()}>
              <div className={styles.titleGroup()}>
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h2 className={styles.title()}>UNO MOD MENU</h2>
                <span className={styles.badge()}>Multi-Player Cheats</span>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn()}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Player Selector Bar */}
            <div className="px-6 py-2.5 bg-zinc-900/80 border-b border-white/10 flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 shrink-0 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Jogador Alvo:
              </span>
              <div className={styles.playerSelectorBar()}>
                {players.map((p) => {
                  const isSelected = p.id === effectiveTargetId
                  const isMe = p.id === currentPlayer?.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTargetPlayerId(p.id)}
                      className={styles.playerChip({ selected: isSelected })}
                    >
                      <User className="w-3 h-3" />
                      <span>{p.name}</span>
                      {isMe && <span className="text-[10px] opacity-75">(Você)</span>}
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                        {p.handCards?.length ?? 0}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status notification */}
            {statusMsg && (
              <div className="px-6 py-2 text-xs font-bold bg-purple-600/30 text-purple-200 border-b border-purple-500/20 animate-in fade-in">
                {statusMsg}
              </div>
            )}

            {/* Tabs */}
            <div className={styles.tabsBar()}>
              <button
                type="button"
                className={styles.tabItem({ active: activeTab === 'hand' })}
                onClick={() => setActiveTab('hand')}
              >
                🃏 Mão ({targetPlayer?.name}) [{targetHandCards.length}]
              </button>
              <button
                type="button"
                className={styles.tabItem({ active: activeTab === 'spawn' })}
                onClick={() => setActiveTab('spawn')}
              >
                ➕ Dar / Spawnar Cartas
              </button>
              <button
                type="button"
                className={styles.tabItem({ active: activeTab === 'table' })}
                onClick={() => setActiveTab('table')}
              >
                🎲 Mesa & Descarte
              </button>
              <button
                type="button"
                className={styles.tabItem({ active: activeTab === 'game' })}
                onClick={() => setActiveTab('game')}
              >
                👑 Partida & Turnos
              </button>
            </div>

            {/* Content Body */}
            <div className={styles.body()}>
              {/* TAB 1: HAND */}
              {activeTab === 'hand' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={styles.sectionTitle()}>
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Ações Rápidas para {targetPlayer?.name}{' '}
                      {isTargetSelf && '(Você)'}
                    </h3>
                    <div className={styles.quickActionsGrid()}>
                      <button
                        type="button"
                        onClick={() => handleSetHandCount(1)}
                        className={styles.quickActionBtn({ variant: 'amber' })}
                      >
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-amber-300">Modo UNO!</div>
                          <div className="text-[10px] text-zinc-400">Deixar com 1 carta</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantWin()}
                        className={styles.quickActionBtn({ variant: 'emerald' })}
                      >
                        <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-emerald-300">Fazer Vencer</div>
                          <div className="text-[10px] text-zinc-400">Ganha a partida</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpawnCustomCard('buy-4', 'black', 1)}
                        className={styles.quickActionBtn({ variant: 'purple' })}
                      >
                        <Plus className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-purple-300">Dar +4 Coringa</div>
                          <div className="text-[10px] text-zinc-400">Entrega Wild +4</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpawnCustomCard('buy-4', 'black', 4)}
                        className={styles.quickActionBtn({ variant: 'rose' })}
                      >
                        <Bomb className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-rose-300">Spam 4x (+4)</div>
                          <div className="text-[10px] text-zinc-400">Sobrecarga de cartas</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpawnCustomCard('change-color', 'black', 1)}
                        className={styles.quickActionBtn({ variant: 'blue' })}
                      >
                        <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-blue-300">Dar Mudar Cor</div>
                          <div className="text-[10px] text-zinc-400">Coringa simples</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetHandCount(10)}
                        className={styles.quickActionBtn({ variant: 'rose' })}
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <div className="font-extrabold text-rose-300">Encher Mão (10x)</div>
                          <div className="text-[10px] text-zinc-400">Dificultar vitória</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className={styles.sectionTitle()}>
                      Cartas de {targetPlayer?.name} ({targetHandCards.length}) — Clique no lápis para editar ou na lixeira para remover:
                    </h3>
                    {targetHandCards.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-4 text-center">Nenhuma carta nesta mão.</p>
                    ) : (
                      <div className={styles.cardsGrid()}>
                        {targetHandCards.map((card, idx) => (
                          <div key={card.id || idx} className={styles.cardItem()}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCard(card)
                                setSwapType(card.type)
                                setSwapColor(card.color || 'black')
                              }}
                              className={styles.editCardBtn()}
                              title="Editar / Trocar esta carta"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCard(card.id)}
                              className={styles.deleteCardBtn()}
                              title="Remover esta carta"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <PlayingCard card={card} size="sm" />
                            <span className="text-[10px] font-semibold text-zinc-300 mt-1 capitalize truncate w-full text-center">
                              {card.type} {card.color !== 'black' && card.color}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SPAWN */}
              {activeTab === 'spawn' && (
                <div className="space-y-6">
                  {/* Target Player Banner */}
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <span className="font-bold text-purple-200">
                      Entregando cartas para:{' '}
                      <span className="font-extrabold text-white underline">{targetPlayer?.name}</span>
                      {isTargetSelf ? ' (Você)' : ' (Outro Jogador)'}
                    </span>
                    <span className="text-purple-400 text-[11px]">Selecione outro jogador acima se desejar</span>
                  </div>

                  {/* Live Preview & Quantity */}
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                    <div className="shrink-0 flex flex-col items-center">
                      <PlayingCard card={previewCard} size="md" />
                      <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold">Preview</span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm font-extrabold text-white capitalize">
                          {selectedType} {previewColor !== 'black' ? previewColor : 'Coringa'}
                        </div>
                        <div className="text-xs text-zinc-400">
                          Escolha os atributos e envie diretamente para {targetPlayer?.name}.
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-zinc-400">Quantidade:</span>
                        {[1, 2, 4, 8].map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setQuantity(qty)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              quantity === qty
                                ? 'bg-purple-600 text-white border-purple-400'
                                : 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
                            }`}
                          >
                            {qty}x
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSpawnCustomCard()}
                        className={styles.submitBtn()}
                      >
                        ➕ Dar para {targetPlayer?.name} ({quantity}x)
                      </button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className={styles.sectionTitle()}>Cor da Carta</h3>
                    <div className="flex flex-wrap gap-2">
                      {ALL_COLORS.map(({ color, name }) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={styles.swatchBtn({
                            selected: selectedColor === color,
                            colorName: color as 'red' | 'blue' | 'green' | 'yellow' | 'black',
                          })}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Types */}
                  <div>
                    <h3 className={styles.sectionTitle()}>Tipo da Carta</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_TYPES.map(({ type, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedType(type)
                            if (type === 'buy-4' || type === 'change-color') {
                              setSelectedColor('black')
                            }
                          }}
                          className={styles.typePill({ selected: selectedType === type })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TABLE / DISCARD */}
              {activeTab === 'table' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-6">
                    {topDiscardCard ? (
                      <div className="shrink-0 flex flex-col items-center">
                        <PlayingCard card={topDiscardCard} size="md" />
                        <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold">Topo Atual</span>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400">Nenhuma carta na pilha de descarte.</div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-bold text-white">Carta Atual na Mesa</div>
                      <p className="text-xs text-zinc-400">
                        Altere a carta do topo para fazer com que qualquer carta da mão se torne válida para jogar
                        imediatamente!
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={styles.sectionTitle()}>Trocar Carta do Topo Para:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetTopCard('7', 'red')}
                        className={styles.quickActionBtn({ variant: 'rose' })}
                      >
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div>
                          <div className="font-bold">Vermelho 7</div>
                          <div className="text-[10px] text-zinc-400">Mesa Vermelha</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetTopCard('7', 'blue')}
                        className={styles.quickActionBtn({ variant: 'blue' })}
                      >
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div>
                          <div className="font-bold">Azul 7</div>
                          <div className="text-[10px] text-zinc-400">Mesa Azul</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetTopCard('7', 'green')}
                        className={styles.quickActionBtn({ variant: 'emerald' })}
                      >
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div>
                          <div className="font-bold">Verde 7</div>
                          <div className="text-[10px] text-zinc-400">Mesa Verde</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetTopCard('7', 'yellow')}
                        className={styles.quickActionBtn({ variant: 'amber' })}
                      >
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div>
                          <div className="font-bold">Amarelo 7</div>
                          <div className="text-[10px] text-zinc-400">Mesa Amarela</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GAME & TURN */}
              {activeTab === 'game' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <div className="font-extrabold text-sm text-white">Controle de Partida & Turnos</div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Escolha qualquer jogador para forçar a vez ou conceder vitória instantânea:
                    </p>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-zinc-300">Passar o turno imediatamente para:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {players.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleForceTurn(p.id)}
                            className={styles.quickActionBtn({ variant: 'purple' })}
                          >
                            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                            <div className="truncate">
                              <div className="font-bold truncate">{p.name}</div>
                              <div className="text-[10px] text-zinc-400">Vez de {p.name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <span className="text-xs font-bold text-zinc-300">Conceder vitória instantânea para:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {players.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleInstantWin(p.id)}
                            className={styles.quickActionBtn({ variant: 'emerald' })}
                          >
                            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <div className="font-bold truncate">{p.name}</div>
                              <div className="text-[10px] text-zinc-400">Vitória oficial</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD EDIT MODAL (when editing a specific card in hand) */}
            {editingCard && (
              <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-between animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-extrabold uppercase text-white">
                      Editar Carta de {targetPlayer?.name}
                    </h3>
                  </div>
                  <button type="button" onClick={() => setEditingCard(null)} className={styles.closeBtn()}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-6 py-4">
                  <div className="flex flex-col items-center">
                    <PlayingCard card={swapPreviewCard} size="md" />
                    <span className="text-[10px] text-purple-300 font-bold mt-1 uppercase">Nova Carta</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-300">Escolha a nova cor:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ALL_COLORS.map(({ color, name }) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSwapColor(color)}
                            className={styles.swatchBtn({
                              selected: swapColor === color,
                              colorName: color as 'red' | 'blue' | 'green' | 'yellow' | 'black',
                            })}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-zinc-300">Escolha o novo tipo:</span>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1 max-h-36 overflow-y-auto">
                        {ALL_TYPES.map(({ type, label }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setSwapType(type)
                              if (type === 'buy-4' || type === 'change-color') {
                                setSwapColor('black')
                              }
                            }}
                            className={styles.typePill({ selected: swapType === type })}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSwapCard}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-extrabold text-white uppercase shadow-lg shadow-purple-500/20 hover:brightness-110 cursor-pointer"
                  >
                    Salvar e Substituir Carta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
