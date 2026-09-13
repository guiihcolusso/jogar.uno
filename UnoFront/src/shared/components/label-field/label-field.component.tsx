'use client'

import { createElement } from 'react'

import { cn } from '@/shared/utils/cn'
import type { As } from '@/types/ui-types'

import { styles } from './label-field.styles'
import type { LabelFieldParams } from './label-field.types'

export const LabelField = <C extends As = 'input'>({
  label,
  className,
  htmlFor,
  as,
  ...props
}: LabelFieldParams<C>) => {
  const Component = (as ?? 'input') as As
  return (
    <div className={cn(styles.container(), className)}>
      <label className={styles.label()} htmlFor={htmlFor}>
        {label}
      </label>
      {createElement(Component, { ...props, id: htmlFor, 'aria-label': htmlFor })}
    </div>
  )
}
