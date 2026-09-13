const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'cpf',
  'cnpj',
  'document',
])

const REDACTED = '[REDACTED]'

export function redact<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => redact(item)) as unknown as T

  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = REDACTED
    } else if (typeof val === 'object' && val !== null) {
      result[key] = redact(val)
    } else {
      result[key] = val
    }
  }
  return result as T
}
