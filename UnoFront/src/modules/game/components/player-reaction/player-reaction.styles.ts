import { cva } from 'class-variance-authority'

export const styles = {
  bubble: cva(
    'absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-full border border-accent-3/60 bg-surface/90 px-3 py-1 text-[11px] font-black tracking-wide whitespace-nowrap text-accent-3 shadow-[0_0_16px_rgba(34,211,238,0.6)]',
  ),
}
