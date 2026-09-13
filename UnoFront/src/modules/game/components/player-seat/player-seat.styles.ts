import { cva } from 'class-variance-authority'

export const styles = {
  container: cva('flex flex-col items-center gap-1.5', {
    variants: {
      position: {
        left: '[grid-area:left] self-center justify-self-start',
        top: '[grid-area:top] self-start justify-self-center',
        topLeft: '[grid-area:topLeft] self-start justify-self-start',
        topRight: '[grid-area:topRight] self-start justify-self-end',
        right: '[grid-area:right] self-center justify-self-end',
        bottom: '[grid-area:bottom] self-end justify-self-center',
        bottomLeft: '[grid-area:bottomLeft] self-end justify-self-start',
        bottomRight: '[grid-area:bottomRight] self-end justify-self-end',
      },
    },
  }),
  avatarWrapper: cva('relative rounded-full p-0.5 transition-shadow', {
    variants: {
      active: {
        true: 'shadow-[0_0_20px_2px_var(--accent-3)] ring-2 ring-accent-3',
        false: '',
      },
    },
  }),
  avatar: cva('h-11 w-11 text-sm'),
  name: cva('max-w-24 truncate text-xs font-semibold text-foreground'),
  count: cva(
    'absolute -right-1.5 -bottom-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/10 bg-surface/80 px-1.5 text-[11px] font-bold text-foreground',
  ),
  unoBadge: cva('text-[10px] font-black tracking-wide text-danger'),
}
