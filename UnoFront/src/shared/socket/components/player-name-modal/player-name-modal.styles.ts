import { cva } from 'class-variance-authority'

export const styles = {
  backdrop: cva('flex min-h-screen w-full items-center justify-center p-4'),
  container: cva(
    'w-full max-w-sm rounded-2xl border border-white/10 bg-surface/80 p-8 text-center shadow-[0_0_40px_-8px_var(--accent)] backdrop-blur-xl',
  ),
  logo: cva('mx-auto mb-2 h-16 w-16 text-accent drop-shadow-[0_0_18px_var(--accent)]'),
  title: cva('text-2xl font-bold tracking-wide text-foreground'),
  subtitle: cva('mt-1 text-sm text-default-500'),
  form: cva('mt-6 flex flex-col gap-4'),
  submit: cva('mt-1'),
}
