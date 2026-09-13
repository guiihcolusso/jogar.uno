import { cva } from 'class-variance-authority'

export const styles = {
  card: cva(
    'glass-panel flex flex-col gap-4 rounded-2xl p-5 transition-all hover:border-accent/50 hover:shadow-[0_0_24px_-8px_var(--accent)]',
  ),
  header: cva('flex items-start justify-between gap-2'),
  title: cva('truncate text-lg font-bold text-foreground'),
  subtitle: cva('font-mono text-xs text-default-500'),
  status: cva('', {
    variants: {
      status: {
        waiting: 'text-warning',
        playing: 'text-success',
        ended: 'text-danger',
      },
    },
  }),
  footer: cva('flex items-center justify-between gap-3'),
  avatars: cva('flex -space-x-2'),
  avatar: cva('h-7 w-7 border-2 border-surface text-[10px]'),
  avatarPlaceholder: cva('h-7 w-7 rounded-full border-2 border-dashed border-default-400 bg-default/40'),
  slots: cva('text-xs text-default-500'),
}
