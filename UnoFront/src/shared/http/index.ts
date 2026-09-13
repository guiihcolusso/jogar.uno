export { toQueryParams,unwrap } from './http.adapter'
export type { HttpRequestInit, HttpResponse, QueryParams, QueryParamValue } from './http.types'
export { clientHttp } from './providers'
export { HttpError } from '@/shared/errors'
// `serverHttp` é importado via path explícito (`@/shared/http/providers/server.provider`)
// para que o bundler nunca arraste `'server-only'` para o client bundle.
