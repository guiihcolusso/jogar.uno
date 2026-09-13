import { env } from '@/config/env'

import type { LogContext, Logger } from '../logger.types'
import { redact } from '../redact'

function format(level: string, message: string, context?: LogContext) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: redact(context) } : {}),
  })
}

export const logger: Logger = {
  debug(message, context) {
    if (env.NODE_ENV === 'production') return
    console.debug(format('debug', message, context))
  },
  info(message, context) {
    console.info(format('info', message, context))
  },
  warn(message, context) {
    console.warn(format('warn', message, context))
  },
  error(message, context) {
    console.error(format('error', message, context))
  },
}
