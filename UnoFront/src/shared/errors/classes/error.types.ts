/**
 * Tipos utilitários compartilhados pela hierarquia de erros.
 * Mantém o construtor da `AppError` enxuto (`message + options.cause`).
 */
export type AppErrorOptions = {
  cause?: unknown
}
