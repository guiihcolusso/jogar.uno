import {
	GameAmountToBuyChangedEventData,
	PlayerBlockedEventData,
	PlayerBoughtCardEventData,
	PlayerBuyCardsEventData,
	PlayerChoseCardColorEventData,
	PlayerCardUsabilityConsolidatedEventData,
} from "../common/types"

/**
 * The pure rules engine (GameEngineService) never talks to sockets or Redis
 * directly - it returns a description of what happened as an ordered list
 * of these, and the orchestrator (GameService) is responsible for emitting
 * them in order. This keeps the card-rules logic trivially unit-testable.
 */
export type GameEngineEvent =
	| { event: "PlayerChoseCardColor"; data: PlayerChoseCardColorEventData }
	| { event: "PlayerBlocked"; data: PlayerBlockedEventData }
	| { event: "GameAmountToBuyChanged"; data: GameAmountToBuyChangedEventData }
	| { event: "PlayerBuyCards"; data: PlayerBuyCardsEventData }
	| { event: "PlayerBoughtCard"; data: PlayerBoughtCardEventData }

export interface PlayerCardUsabilityResult {
	consolidated: PlayerCardUsabilityConsolidatedEventData
}
