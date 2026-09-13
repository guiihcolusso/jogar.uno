import { cva } from 'class-variance-authority'

export const styles = {
  screen: cva('mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8'),
  header: cva('flex flex-wrap items-center justify-between gap-4'),
  title: cva('text-3xl font-black tracking-tight text-foreground'),
  grid: cva('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'),
  empty: cva('glass-panel rounded-2xl p-10 text-center text-default-500'),
}
