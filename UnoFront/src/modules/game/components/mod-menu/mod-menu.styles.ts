import { cva } from 'class-variance-authority'

export const styles = {
  floatingTrigger: cva(
    'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold text-xs tracking-wider uppercase border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-purple-500/30',
  ),
  backdrop: cva(
    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200',
  ),
  panel: cva(
    'relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-zinc-950/95 border border-purple-500/30 text-white shadow-2xl shadow-purple-500/10 overflow-hidden',
  ),
  header: cva(
    'flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-sm',
  ),
  titleGroup: cva('flex items-center gap-3'),
  title: cva(
    'text-base font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent uppercase',
  ),
  badge: cva(
    'px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40',
  ),
  closeBtn: cva(
    'p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors',
  ),
  tabsBar: cva(
    'flex items-center gap-1 px-4 py-2 bg-zinc-900/40 border-b border-white/5 overflow-x-auto no-scrollbar',
  ),
  tabItem: cva(
    'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer',
    {
      variants: {
        active: {
          true: 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20',
          false: 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent',
        },
      },
    },
  ),
  body: cva('flex-1 p-6 overflow-y-auto space-y-6'),
  sectionTitle: cva('text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2'),
  quickActionsGrid: cva('grid grid-cols-2 sm:grid-cols-3 gap-2.5'),
  quickActionBtn: cva(
    'flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all text-left group cursor-pointer active:scale-95',
    {
      variants: {
        variant: {
          purple: 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/40 hover:border-purple-400',
          emerald: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/40 hover:border-emerald-400',
          amber: 'bg-amber-950/40 border-amber-500/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-400',
          rose: 'bg-rose-950/40 border-rose-500/30 text-rose-200 hover:bg-rose-900/40 hover:border-rose-400',
          blue: 'bg-blue-950/40 border-blue-500/30 text-blue-200 hover:bg-blue-900/40 hover:border-blue-400',
        },
      },
      defaultVariants: {
        variant: 'purple',
      },
    },
  ),
  playerSelectorBar: cva(
    'flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-white/10 overflow-x-auto no-scrollbar',
  ),
  playerChip: cva(
    'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
    {
      variants: {
        selected: {
          true: 'bg-purple-600 text-white shadow-md shadow-purple-500/30 border border-purple-400',
          false: 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 border border-white/5',
        },
      },
    },
  ),
  cardsGrid: cva('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-1'),
  cardItem: cva(
    'relative group flex flex-col items-center p-2 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-purple-500/50 transition-all duration-150',
  ),
  deleteCardBtn: cva(
    'absolute top-1 right-1 p-1 rounded-full bg-rose-500/80 text-white opacity-80 hover:opacity-100 transition-all hover:scale-110 cursor-pointer',
  ),
  editCardBtn: cva(
    'absolute top-1 left-1 p-1 rounded-full bg-purple-600/80 text-white opacity-80 hover:opacity-100 transition-all hover:scale-110 cursor-pointer',
  ),
  swatchBtn: cva(
    'h-8 px-3 rounded-xl border text-xs font-bold transition-transform cursor-pointer flex items-center justify-center gap-1.5',
    {
      variants: {
        selected: {
          true: 'ring-2 ring-white scale-105 shadow-md',
          false: 'opacity-70 hover:opacity-100 hover:scale-100',
        },
        colorName: {
          red: 'bg-red-600 border-red-400 text-white',
          blue: 'bg-blue-600 border-blue-400 text-white',
          green: 'bg-emerald-600 border-emerald-400 text-white',
          yellow: 'bg-amber-500 border-amber-300 text-black',
          black: 'bg-zinc-800 border-zinc-600 text-white',
        },
      },
    },
  ),
  typePill: cva(
    'px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center',
    {
      variants: {
        selected: {
          true: 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/30',
          false: 'bg-zinc-900/80 border-white/10 text-zinc-300 hover:bg-zinc-800',
        },
      },
    },
  ),
  submitBtn: cva(
    'w-full py-3 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:brightness-110 active:scale-95 text-white',
  ),
}
