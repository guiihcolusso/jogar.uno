import { cva } from 'class-variance-authority'

export const styles = {
  grid: cva('grid grid-cols-2 gap-4 p-2'),
  swatch: cva(
    'h-20 w-20 rounded-2xl border-4 border-white/20 transition-transform hover:scale-105 focus-visible:scale-105',
  ),
}
