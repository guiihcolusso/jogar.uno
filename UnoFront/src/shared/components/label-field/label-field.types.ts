import type { ComponentPropsWithoutRef } from 'react'

import type { As, MergeWithAs, PropsOf } from '@/types/ui-types'

export type LabelFieldParams<C extends As = 'input'> = MergeWithAs<
  ComponentPropsWithoutRef<'div'>,
  PropsOf<C>,
  {
    label: string
    htmlFor?: string
  },
  C
>
