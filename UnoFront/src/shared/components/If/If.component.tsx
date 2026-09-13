import type { IfParams } from './If.types'

export const If = ({ condition, children }: IfParams) => {
  return condition ? <>{children}</> : null
}
