import { AppError } from './app.error'

export class ValidationError extends AppError {
  readonly code: string = 'VALIDATION_ERROR'
  constructor(
    message: string,
    public readonly issues: unknown,
    options?: { cause?: unknown },
  ) {
    super(message, options)
  }
}
