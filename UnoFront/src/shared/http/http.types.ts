export type HttpResponse<T> = {
  hasError: boolean
  data: T | null
  status: number
  statusText?: string
  url?: string
}

export type QueryParamValue = string | number | boolean | undefined | null | Array<string | number>

export type QueryParams = Record<string, QueryParamValue>

export type HttpRequestInit = Omit<RequestInit, 'body'> & {
  params?: Record<string, string | number | boolean>
  body?: unknown
}
