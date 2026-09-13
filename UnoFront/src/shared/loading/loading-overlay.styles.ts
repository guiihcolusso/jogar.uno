import { cva } from 'class-variance-authority'

export const styles = {
  overlay: cva('fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm'),
}
