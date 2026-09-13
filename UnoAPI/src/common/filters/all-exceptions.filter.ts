import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common"
import { WsException } from "@nestjs/websockets"
import { Response } from "express"
import { Socket } from "socket.io"

/**
 * Single catch-all filter for both HTTP controllers and the WS gateway,
 * replacing the old @uno-game/error-handler package (which isn't available
 * in this checkout) with Nest's built-in exception filter mechanism plus a
 * real logger.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger("ExceptionsHandler")

	catch (exception: unknown, host: ArgumentsHost): void {
		if (host.getType() === "ws") {
			this.handleWsException(exception, host)

			return
		}

		this.handleHttpException(exception, host)
	}

	private handleHttpException (exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		const status = exception instanceof HttpException
			? exception.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR

		const message = exception instanceof HttpException
			? exception.getResponse()
			: "Internal server error"

		if (!(exception instanceof HttpException)) {
			this.logger.error(exception instanceof Error ? exception.stack : exception)
		}

		response.status(status).json({
			statusCode: status,
			message,
		})
	}

	private handleWsException (exception: unknown, host: ArgumentsHost): void {
		const client = host.switchToWs().getClient<Socket>()

		const message = exception instanceof WsException
			? exception.getError()
			: exception instanceof Error
				? exception.message
				: "Internal server error"

		if (!(exception instanceof WsException)) {
			this.logger.error(exception instanceof Error ? exception.stack : exception)
		} else {
			this.logger.warn(typeof message === "string" ? message : JSON.stringify(message))
		}

		client.emit("exception", {
			status: "error",
			message,
		})
	}
}
