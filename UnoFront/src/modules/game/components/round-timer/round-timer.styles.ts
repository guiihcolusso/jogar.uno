import { cva } from 'class-variance-authority'

export const styles = {
  container: cva('mx-auto flex w-full max-w-xs flex-col items-center gap-1 pt-3'),
  label: cva('text-xs font-semibold tracking-wide text-default-500 uppercase'),
  track: cva('h-1.5 w-full overflow-hidden rounded-full bg-white/10'),
  fill: cva('h-full rounded-full bg-gradient-to-r from-accent-3 to-accent transition-[width] duration-1000 ease-linear', {
    variants: {
      low: {
        true: 'from-danger to-danger animate-pulse',
        false: '',
      },
    },
  }),
}
