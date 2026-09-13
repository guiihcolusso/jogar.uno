import { cva } from 'class-variance-authority'

export const styles = {
  image: cva('pointer-events-none rounded-lg select-none', {
    variants: {
      size: {
        sm: 'h-14 w-9',
        md: 'h-24 w-16',
        lg: 'h-32 w-21',
      },
      selected: {
        true: 'ring-4 ring-accent-3 shadow-[0_0_18px_2px_rgba(34,211,238,0.65)] -translate-y-3',
        false: '',
      },
      dimmed: {
        true: 'brightness-50 saturate-50',
        false: 'saturate-[1.4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
      },
    },
    defaultVariants: {
      size: 'md',
      selected: false,
      dimmed: false,
    },
  }),
}
