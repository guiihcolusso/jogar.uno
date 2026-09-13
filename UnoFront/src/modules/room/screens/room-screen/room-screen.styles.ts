import { cva } from 'class-variance-authority'

export const styles = {
  screen: cva('mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-8'),
  header: cva('flex flex-wrap items-center justify-between gap-4'),
  title: cva('truncate text-3xl font-black tracking-tight text-foreground'),
  titleAccent: cva('text-accent'),
  sectionTitle: cva('text-xs font-bold tracking-widest text-default-500 uppercase'),
  list: cva('flex flex-col gap-3'),
  loading: cva('flex min-h-[40vh] items-center justify-center'),
}
