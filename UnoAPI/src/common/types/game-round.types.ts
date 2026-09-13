/**
 * Persisted round-timer metadata. Deliberately holds no JS Timeout/Interval
 * handles (those can't survive a process restart or be serialized into
 * Redis) - only enough to recompute remaining time, and to let the process
 * re-arm live timers for in-progress games on boot.
 */
export interface GameRoundCounter {
	gameId: string
	timeInSeconds: number
	initializedAtMilliseconds: number
}
