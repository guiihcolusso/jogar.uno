import { AppError } from './app.error'

export class UnauthorizedError extends AppError {
  readonly code: string = 'UNAUTHORIZED'
}
