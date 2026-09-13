import { cva } from 'class-variance-authority'

export const styles = {
  container: cva('glass-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3'),
  info: cva('flex items-center gap-3'),
  avatar: cva('h-9 w-9 text-sm'),
  name: cva('max-w-40 truncate font-semibold text-foreground'),
  you: cva('text-xs text-default-500'),
  status: cva('text-xs font-bold tracking-wide', {
    variants: {
      ready: {
        true: 'text-success',
        false: 'text-default-500',
      },
    },
  }),
}
