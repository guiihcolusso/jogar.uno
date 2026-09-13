import { AppError } from './app.error'

export class NotFoundError extends AppError {
  readonly code: string = 'NOT_FOUND'
}
