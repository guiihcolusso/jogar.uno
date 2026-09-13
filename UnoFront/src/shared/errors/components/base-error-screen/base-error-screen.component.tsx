'use client'

import Link from 'next/link'

import { cn } from '@/shared/utils/cn'

import { styles } from './base-error-screen.styles'
import type { BaseErrorScreenParams } from './base-error-screen.types'

export const BaseErrorScreen = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  containerClassName,
  iconSlot,
}: BaseErrorScreenParams) => {
  return (
    <div className={cn(styles.container(), containerClassName)}>
      <div className={styles.body()}>
        <h1 className={styles.title()}>{title}</h1>
        <div className={styles.description()}>{description}</div>
        <div className={styles.actions()}>
          {primaryAction && primaryAction.href ? (
            <Link
              href={primaryAction.href}
              className="inline-flex px-4 py-2 rounded-full bg-primary text-white hover:opacity-90"
            >
              {primaryAction.label}
            </Link>
          ) : primaryAction ? (
            <button
              onClick={primaryAction.onPress}
              className="inline-flex px-4 py-2 rounded-full bg-primary text-white hover:opacity-90"
            >
              {primaryAction.label}
            </button>
          ) : null}
          {secondaryAction && secondaryAction.href ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex px-4 py-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              {secondaryAction.label}
            </Link>
          ) : secondaryAction ? (
            <button
              onClick={secondaryAction.onPress}
              className="inline-flex px-4 py-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      </div>
      {iconSlot}
    </div>
  )
}
