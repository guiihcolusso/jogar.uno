import { Injectable, Logger } from "@nestjs/common"
import { Server } from "socket.io"

import { buildRoomName, SocketRoomContext } from "./room.util"

/**
 * Thin wrapper around the socket.io `Server` instance so that plain
 * injectable services (GameService, ChatService, ...) can broadcast to
 * rooms without depending on the gateway itself. The gateway hands us the
 * `Server` reference once, from its `afterInit` lifecycle hook - mirroring
 * the old SocketService.setup(io) call.
 */
@Injectable()
export class SocketEmitterService {
	private readonly logger = new Logger(SocketEmitterService.name)
	private server: Server | undefined

	setServer (server: Server): void {
		this.server = server
	}

	emitToRoom<Data> (context: SocketRoomContext, id: string, event: string, data: Data): void {
		if (!this.server) {
			this.logger.warn(`Tried to emit "${event}" before the socket server was initialized`)

			return
		}

		const roomName = buildRoomName(context, id)

		this.server.to(roomName).emit(event, data)
	}
}
