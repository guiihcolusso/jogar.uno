import { Injectable } from "@nestjs/common"

import { getSanitizedValueWithBoundaries } from "../common/utils/number.util"
import {
	CardColors,
	CardData,
	CurrentPlayerInfo,
	Game,
	PlayerData,
} from "../common/types"
import { GameEngineEvent, PlayerCardUsabilityResult } from "./game-engine.types"

/**
 * Pure card-rules engine, ported 1:1 from the original GameService's
 * private methods. No persistence, no sockets - only Game/PlayerData/CardData
 * in, mutated Game + a list of events to emit out. This is deliberately kept
 * free of NestJS DI concerns beyond @Injectable() so it stays easy to unit
 * test in isolation from Redis/gateways.
 */
@Injectable()
export class GameEngineService {
	getTopStackCard (game: Game): CardData | undefined {
		return game?.usedCards?.[0]
	}

	cardCanBeBuyCombed (game: Game, card: CardData): boolean {
		const currentCardComboType = game?.currentCardCombo?.cardTypes?.[0]

		return (
			(card.type === "buy-2" && currentCardComboType === "buy-4" && card.color === game.currentGameColor) ||
			(card.type === "buy-2" && currentCardComboType === "buy-2") ||
			(card.type === "buy-4")
		)
	}

	getCurrentPlayerInfo (game: Game): CurrentPlayerInfo {
		const { players } = game

		const currentPlayer = players[game?.currentPlayerIndex]

		let gameStatus: CurrentPlayerInfo["gameStatus"]

		/**
		 * In case the current player has no card on hand, he's the winner
		 */
		if (currentPlayer?.handCards.length === 0) {
			gameStatus = "winner"
		/**
		 * In case the player has only one card, he's made uno
		 */
		} else if (currentPlayer?.handCards.length === 1) {
			gameStatus = "uno"
		}

		return {
			id: currentPlayer?.id,
			name: currentPlayer?.name,
			playerStatus: currentPlayer?.status,
			gameStatus,
		}
	}

	/**
	 * Applies the special-card rules for the cards that were just played
	 * together (stacking support - e.g. two buy-2s in one move), keyed on
	 * counting how many of *each* type were played. Mutates and returns
	 * `game`, plus the ordered list of events the caller must emit.
	 */
	buildGameWithCardEffect (game: Game, cards: CardData[], selectedColor: CardColors | undefined): { game: Game; events: GameEngineEvent[] } {
		const events: GameEngineEvent[] = []

		const cardTypes = cards.map(card => card.type)
		const cardIds = cards.map(card => card.id)

		let playerAffected: PlayerData | undefined

		const isBuy4Card = cardTypes.length > 0 && cardTypes.every(cardType => cardType === "buy-4")
		const isBuy2Card = cardTypes.length > 0 && cardTypes.every(cardType => cardType === "buy-2")
		const isChangeColorCard = cardTypes.length > 0 && cardTypes.every(cardType => cardType === "change-color")
		const isReverseCard = cardTypes.length > 0 && cardTypes.every(cardType => cardType === "reverse")
		const isBlockCard = cardTypes.length > 0 && cardTypes.every(cardType => cardType === "block")

		if (isChangeColorCard || isBuy4Card) {
			game.currentGameColor = selectedColor ?? game.currentGameColor

			game.usedCards = game.usedCards.map(card => {
				if (cardIds.includes(card.id)) {
					return {
						...card,
						selectedColor,
						src: (selectedColor && card.possibleColors?.[selectedColor]) ?? card.src,
					}
				}

				return card
			})

			const changedCards = game.usedCards.filter(({ id }) => cardIds.includes(id))

			events.push({ event: "PlayerChoseCardColor", data: { cards: changedCards } })
		}

		if (isReverseCard) {
			if (cardTypes.length % 2 === 0) {
				game.nextPlayerIndex = game.currentPlayerIndex
			} else if (game.direction === "clockwise") {
				game.direction = "counterclockwise"
				game.nextPlayerIndex = game.currentPlayerIndex - 1
			} else {
				game.direction = "clockwise"
				game.nextPlayerIndex = game.currentPlayerIndex + 1
			}
		}

		if (isBlockCard) {
			cardTypes.forEach(() => {
				const nextPlayerIndex = getSanitizedValueWithBoundaries(game?.nextPlayerIndex, game?.players?.length, 0)
				playerAffected = game?.players?.[nextPlayerIndex]

				if (game.direction === "clockwise") {
					game.nextPlayerIndex++
				} else {
					game.nextPlayerIndex--
				}

				events.push({ event: "PlayerBlocked", data: { playerId: playerAffected?.id as string } })
			})
		}

		if (isBuy2Card || isBuy4Card) {
			game.currentCardCombo.cardTypes = [
				...game.currentCardCombo.cardTypes,
				...cardTypes,
			]

			const nextPlayerIndex = getSanitizedValueWithBoundaries(game?.nextPlayerIndex, game?.players?.length, 0)
			playerAffected = game?.players?.[nextPlayerIndex]

			const affectedPlayerCanMakeCardBuyCombo = playerAffected?.handCards
				.some(card => this.cardCanBeBuyCombed(game, card))

			game.currentCardCombo.amountToBuy = 0

			game.currentCardCombo.cardTypes.forEach(cardType => {
				if (cardType === "buy-2") {
					game.currentCardCombo.amountToBuy += 2
				} else if (cardType === "buy-4") {
					game.currentCardCombo.amountToBuy += 4
				}
			})

			events.push({ event: "GameAmountToBuyChanged", data: { amountToBuy: game.currentCardCombo.amountToBuy } })

			if (!affectedPlayerCanMakeCardBuyCombo && playerAffected) {
				events.push({
					event: "PlayerBuyCards",
					data: { playerId: playerAffected.id, amountToBuy: game.currentCardCombo.amountToBuy },
				})

				let available = [...game?.availableCards]

				const boughtCards = available.slice(0, game.currentCardCombo.amountToBuy)

				events.push({
					event: "PlayerBoughtCard",
					data: { playerId: playerAffected.id, cards: boughtCards },
				})

				available = available.slice(game.currentCardCombo.amountToBuy, available.length)

				game.players = game?.players?.map(player => {
					if (player.id === playerAffected?.id) {
						return {
							...player,
							handCards: [...boughtCards, ...player?.handCards],
						}
					}

					return player
				})

				game.availableCards = available

				game.currentCardCombo = {
					cardTypes: [],
					amountToBuy: 0,
				}

				events.push({ event: "GameAmountToBuyChanged", data: { amountToBuy: 0 } })

				if (game.direction === "clockwise") {
					game.nextPlayerIndex++
				} else {
					game.nextPlayerIndex--
				}
			}
		}

		return { game, events }
	}

	/**
	 * For the active player only, computes per-card `canBeUsed`/`canBeCombed`.
	 * For every other player, those fields are blanked out - this is the
	 * anti-cheat privacy boundary: the consolidated event must never contain
	 * another player's hand contents, only {id, canBeUsed, canBeCombed}.
	 */
	buildPlayersWithCardUsability (currentPlayerId: string, game: Game): { players: PlayerData[]; result: PlayerCardUsabilityResult } {
		const topStackCard = this.getTopStackCard(game)

		const playersWithCardUsability = game?.players?.map(player => {
			if (currentPlayerId === player.id) {
				const handCards = player?.handCards?.map(handCard => ({
					...handCard,
					canBeUsed: game?.currentCardCombo?.cardTypes.length ? (
						this.cardCanBeBuyCombed(game, handCard)
					) : (
						topStackCard?.color === handCard?.color ||
						handCard?.type === "change-color" ||
						handCard?.type === "buy-4" ||
						topStackCard?.type === handCard?.type ||
						handCard?.color === game.currentGameColor
					),
					canBeCombed: game.currentCardCombo.cardTypes.includes(handCard?.type),
				}))

				return {
					...player,
					isCurrentRoundPlayer: true,
					canBuyCard: handCards.every(card => !card.canBeUsed),
					handCards,
				}
			}

			return {
				...player,
				isCurrentRoundPlayer: false,
				canBuyCard: false,
				handCards: player?.handCards?.map(handCard => ({
					...handCard,
					canBeUsed: false,
					canBeCombed: false,
				})),
			}
		})

		const consolidatedPlayers = playersWithCardUsability.map(player => ({
			id: player.id,
			isCurrentRoundPlayer: player.isCurrentRoundPlayer,
			canBuyCard: player.canBuyCard,
			handCards: player.handCards.map(handCard => ({
				id: handCard.id,
				canBeUsed: Boolean(handCard.canBeUsed),
				canBeCombed: Boolean(handCard.canBeCombed),
			})),
		}))

		return {
			players: playersWithCardUsability,
			result: { consolidated: { players: consolidatedPlayers } },
		}
	}
}
