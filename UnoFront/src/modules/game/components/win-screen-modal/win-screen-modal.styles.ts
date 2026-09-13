import { cva } from 'class-variance-authority'

export const styles = {
  body: cva('flex flex-col items-center gap-4 py-4 text-center'),
  trophy: cva('h-20 w-20 text-warning drop-shadow-[0_0_24px_rgba(250,204,21,0.7)]'),
  winnerName: cva('text-2xl font-black text-foreground'),
  you: cva('text-sm text-accent-3'),
  footer: cva('flex w-full flex-col gap-2'),
}
