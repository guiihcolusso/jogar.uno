import { cva } from 'class-variance-authority'

export const styles = {
  trigger: cva(
    'flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50',
  ),
  avatar: cva('h-6 w-6 shrink-0 text-xs font-bold'),
  name: cva('max-w-28 truncate'),
  editForm: cva('flex items-center gap-2'),
}
