import { AppError } from './app.error'

export class HttpError extends AppError {
  readonly code: string = 'HTTP_ERROR'
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly response?: unknown,
    options?: { cause?: unknown },
  ) {
    super(message, options)
  }
}
