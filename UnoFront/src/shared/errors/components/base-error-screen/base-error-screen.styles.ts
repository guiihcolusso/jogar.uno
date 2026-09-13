import { cva } from 'class-variance-authority'

export const styles = {
  container: cva(
    'flex h-full min-h-[60vh] w-full flex-col-reverse items-center justify-center gap-8 p-6 md:flex-row md:gap-12 md:p-12',
  ),
  body: cva('flex w-full max-w-xl flex-col gap-4 md:gap-6'),
  title: cva('text-primary text-3xl font-bold'),
  description: cva('text-default-700 text-base leading-relaxed'),
  actions: cva('flex flex-wrap items-center gap-4'),
}
