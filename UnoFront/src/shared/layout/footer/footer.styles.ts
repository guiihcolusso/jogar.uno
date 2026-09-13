import { cva } from 'class-variance-authority'

export const styles = {
  container: cva('border-t border-white/10 bg-surface/60 px-4 py-3 backdrop-blur-sm'),
  inner: cva('mx-auto flex w-full max-w-6xl items-center justify-between gap-3 text-xs text-default-500'),
  brandName: cva('font-bold tracking-wide text-foreground/80'),
  copyright: cva('text-default-500'),
}
