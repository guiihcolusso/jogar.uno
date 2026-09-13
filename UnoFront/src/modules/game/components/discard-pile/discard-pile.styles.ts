import { cva } from 'class-variance-authority'

export const styles = {
  container: cva(
    'relative flex h-36 w-28 items-center justify-center rounded-2xl border border-white/10 transition-colors md:h-44 md:w-32',
    {
      variants: {
        isDropTarget: {
          true: 'border-accent-3 bg-accent-3/10',
          false: '',
        },
      },
    },
  ),
  card: cva('absolute h-24 w-16 rotate-[var(--rotate)] rounded-lg shadow-xl md:h-32 md:w-21'),
  combo: cva(
    'absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-danger/60 bg-surface/90 px-3 py-1 text-sm font-black text-danger shadow-[0_0_16px_rgba(239,68,68,0.6)]',
  ),
  buyButton: cva('absolute -bottom-12 left-1/2 -translate-x-1/2'),
}
