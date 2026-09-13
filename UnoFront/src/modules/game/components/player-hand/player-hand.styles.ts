import { cva } from 'class-variance-authority'

export const styles = {
  container: cva('pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-2'),
  afkBanner: cva(
    'glass-panel pointer-events-auto mx-4 mb-2 flex max-w-md flex-col items-center gap-2 rounded-xl p-4 text-center text-sm',
  ),
  identity: cva('pointer-events-auto flex items-center gap-2'),
  avatar: cva('h-8 w-8 text-xs'),
  name: cva('max-w-32 truncate text-sm font-semibold text-foreground'),
  cardsRow: cva('pointer-events-auto flex items-end justify-center px-4 pb-1', {
    variants: {
      empty: {
        true: 'min-h-24',
        false: '',
      },
    },
  }),
  cardSlot: cva(
    'origin-bottom rotate-[var(--rotate)] -ml-6 first:ml-0 transition-[margin,filter] first:origin-bottom-left last:origin-bottom-right',
  ),
}
