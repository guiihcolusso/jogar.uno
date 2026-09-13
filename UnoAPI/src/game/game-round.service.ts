import { Injectable, Logger } from "@nestjs/common"
import { SchedulerRegistry } from "@nestjs/schedule"

import { SocketEmitterService } from "../common/realtime/socket-emitter.service"
import { GameRoundRepository } from "./game-round.repository"

export interface RoundCounterActions {
	timeInSeconds: number
	timeoutAction: (gameId: string) => Promise<void> | void
	intervalAction: (gameId: string) => Promise<void> | void
}

/**
 * Redesigned from the old raw setTimeout/setInterval handles stored on an
 * in-memory per-game record (which can't survive a restart or be
 * serialized into Redis). Live timers are now tracked in-process via
 * @nestjs/schedule's SchedulerRegistry (keyed by gameId), while the timing
 * metadata needed to compute remaining time - and to re-arm timers for
 * in-progress games after a restart - is persisted in Redis.
 *
 * The actual game-specific callbacks (what happens on timeout/tick) are
 * supplied by GameService at call time rather than persisted - they can't
 * be serialized anyway, and re-supplying them on boot is exactly what
 * GameService's bootstrap re-arm does.
 */
@Injectable()
export class GameRoundService {
	private readonly logger = new Logger(GameRoundService.name)

	constructor (
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly gameRoundRepository: GameRoundRepository,
		private readonly socketEmitter: SocketEmitterService,
	) {}

	async getRoundRemainingTimeInSeconds (gameId: string): Promise<number | null> {
		const gameRoundCounter = await this.gameRoundRepository.getGameRoundCounter(gameId)

		if (!gameRoundCounter) {
			return null
		}

		const { initializedAtMilliseconds, timeInSeconds } = gameRoundCounter

		const currentTimeInMilliseconds = Date.now()
		const passedTimeInSeconds = (currentTimeInMilliseconds - initializedAtMilliseconds) / 1000

		if (passedTimeInSeconds > timeInSeconds) {
			return timeInSeconds
		}

		return Math.round(timeInSeconds - passedTimeInSeconds)
	}

	async resetRoundCounter (gameId: string, actions: RoundCounterActions): Promise<void> {
		this.clearTimers(gameId)

		const timeoutHandle = setTimeout(() => {
			void actions.timeoutAction(gameId)
		}, actions.timeInSeconds * 1000)

		const intervalHandle = setInterval(() => {
			void actions.intervalAction(gameId)
		}, 1000)

		this.schedulerRegistry.addTimeout(this.timeoutName(gameId), timeoutHandle)
		this.schedulerRegistry.addInterval(this.intervalName(gameId), intervalHandle)

		await this.gameRoundRepository.setGameRoundCounterData(gameId, {
			gameId,
			timeInSeconds: actions.timeInSeconds,
			initializedAtMilliseconds: Date.now(),
		})
	}

	async removeRoundCounter (gameId: string): Promise<void> {
		this.clearTimers(gameId)

		await this.gameRoundRepository.deleteGameRoundCounter(gameId)
	}

	emitGameRoundEvent<Data> (gameId: string, event: string, data: Data): void {
		this.socketEmitter.emitToRoom("game", gameId, event, data)
	}

	private clearTimers (gameId: string): void {
		const timeoutName = this.timeoutName(gameId)
		const intervalName = this.intervalName(gameId)

		if (this.schedulerRegistry.doesExist("timeout", timeoutName)) {
			this.schedulerRegistry.deleteTimeout(timeoutName)
		}

		if (this.schedulerRegistry.doesExist("interval", intervalName)) {
			this.schedulerRegistry.deleteInterval(intervalName)
		}
	}

	private timeoutName (gameId: string): string {
		return `game-round-timeout:${gameId}`
	}

	private intervalName (gameId: string): string {
		return `game-round-interval:${gameId}`
	}
}
