export type InternalErrorParams = {
  statusCode?: number
  message?: string
  onRetry?: () => void
  initialPageHref?: string
}
