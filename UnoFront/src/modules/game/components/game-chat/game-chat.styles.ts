import { cva } from 'class-variance-authority'

export const styles = {
  trigger: cva('fixed top-20 right-4 z-30'),
  badge: cva(
    'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground',
  ),
  messages: cva('flex h-full flex-col gap-2 overflow-y-auto p-4'),
  message: cva('text-sm text-foreground'),
  messageAuthor: cva('font-bold text-accent-3'),
  form: cva('flex items-center gap-2 border-t border-white/10 p-3'),
}
