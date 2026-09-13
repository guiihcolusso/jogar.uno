// Classes (runtime)
export type { AppErrorOptions } from './classes'
export { AppError, HttpError, NotFoundError, UnauthorizedError, ValidationError } from './classes'

// Reusable UI primitives
export type { BaseErrorScreenAction, BaseErrorScreenParams, InternalErrorParams, NotFoundDataParams } from './components'
export { BaseErrorScreen, InternalError, NotFoundData } from './components'

// Full-page error screens
export type { NotFoundScreenParams } from './screens'
export { NotFoundScreen } from './screens'

// Locales (registry per-module)
export { errorsLocales, type ErrorsMessages } from './locales'
