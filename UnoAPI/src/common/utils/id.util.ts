import { randomUUID } from "node:crypto"

export function makeUUID (): string {
	return randomUUID()
}

/**
 * Short id used for game/chat ids - just the last segment of a UUID.
 */
export function makeShortUUID (): string {
	return randomUUID().split("-").pop() as string
}
