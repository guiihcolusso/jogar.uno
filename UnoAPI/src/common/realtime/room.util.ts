export type SocketRoomContext = "game" | "player" | "chat"

/**
 * Room naming is intentionally identical to the old server: "game:<id>",
 * "player:<id>", "chat:<id>". Rooms are joined opportunistically per action.
 */
export function buildRoomName (context: SocketRoomContext, id: string): string {
	return `${context}:${id}`
}
