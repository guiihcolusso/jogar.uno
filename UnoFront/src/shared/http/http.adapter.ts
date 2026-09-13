import { HttpError } from '@/shared/errors'

import type { HttpResponse, QueryParams } from './http.types'

/**
 * Converte `HttpResponse<T>` em `T`, lançando `HttpError` quando há erro.
 * Centraliza a transição "result-style → throw-style" para que callers
 * possam usar try/catch padrão.
 */
export function unwrap<T>(res: HttpResponse<T>): T {
  if (res.hasError) {
    throw new HttpError(res.statusText || `HTTP error ${res.status}`, res.status, res.url ?? '', res.data)
  }
  if (res.data === undefined || res.data === null) {
    throw new HttpError('Empty response body', res.status, res.url ?? '', res.data)
  }
  return res.data
}

/**
 * Normaliza um `QueryParams` (que pode ter arrays / undefined / null)
 * em `Record<string, string | number | boolean>` aceito pelo cliente HTTP.
 * Arrays viram chaves indexadas (`tag[0]=a&tag[1]=b`).
 */
export function toQueryParams(params: QueryParams): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        result[`${key}[${i}]`] = v
      })
      continue
    }

    result[key] = value
  }

  return result
}
