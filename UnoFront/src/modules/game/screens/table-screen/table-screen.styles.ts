import { cva } from 'class-variance-authority'

export const styles = {
  screen: cva(
    'relative flex h-[calc(100vh-var(--header-height))] w-full flex-col items-center overflow-hidden select-none',
  ),
  table: cva(
    'uno-table-grid grid h-full w-full max-w-5xl flex-1 grid-cols-3 grid-rows-3 items-center justify-items-center gap-2 px-4 pt-2 pb-56 md:pb-64',
  ),
  center: cva('[grid-area:center] flex flex-col items-center justify-center gap-3'),
  loading: cva('flex h-full w-full items-center justify-center'),
}
