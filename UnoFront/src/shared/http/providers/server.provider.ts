import { env } from '@/config/env'

import type { HttpRequestInit, HttpResponse } from '../http.types'

import 'server-only'

function buildUrl(baseURL: string, path: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(`${baseURL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value))
    }
  }
  return url.toString()
}

async function serverRequest<T>(method: string, path: string, init?: HttpRequestInit): Promise<HttpResponse<T>> {
  const url = buildUrl(env.NEXT_PUBLIC_API_BASE_URL, path, init?.params)
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')

  let body: BodyInit | undefined
  if (init?.body !== undefined && init?.body !== null) {
    if (init.body instanceof FormData) {
      body = init.body
    } else {
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
      body = JSON.stringify(init.body)
    }
  }

  try {
    const response = await fetch(url, { ...init, method, headers, body, cache: 'no-store' })
    const isJson = response.headers.get('content-type')?.includes('application/json') ?? false
    let data: unknown = null
    if (response.status !== 204) {
      data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null)
    }
    return {
      hasError: !response.ok,
      data: data as T,
      status: response.status,
      statusText: response.statusText,
      url,
    }
  } catch (cause) {
    return {
      hasError: true,
      data: null,
      status: 0,
      statusText: cause instanceof Error ? cause.message : 'Network error',
      url,
    }
  }
}

/**
 * No real auth in this app (guest identity only) — the server client is just
 * a factory so call sites match the boilerplate's `await serverHttp()` shape.
 */
export async function serverHttp() {
  return {
    get: <T>(path: string, init?: HttpRequestInit) => serverRequest<T>('GET', path, init),
    post: <T>(path: string, body: unknown, init?: HttpRequestInit) => serverRequest<T>('POST', path, { ...init, body }),
    put: <T>(path: string, body: unknown, init?: HttpRequestInit) => serverRequest<T>('PUT', path, { ...init, body }),
    patch: <T>(path: string, body: unknown, init?: HttpRequestInit) =>
      serverRequest<T>('PATCH', path, { ...init, body }),
    delete: <T>(path: string, init?: HttpRequestInit) => serverRequest<T>('DELETE', path, init),
  }
}
