/** Shared dashboard theme — matches withdraw page styling */

export const dashboardTheme = {
  accent: '#FBF676',
  accentDark: '#0C1A6B',
  inputBg: '#081028',

  page: 'w-full min-h-full py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden',
  pageInner: 'relative z-10',

  title:
    'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg',
  subtitle: 'mt-1 text-sm text-white/55',

  card: 'rounded-2xl shadow-2xl border border-[#FBF676]/25 p-6 md:p-8 backdrop-blur-md bg-[rgba(8,16,40,0.75)]',
  cardInner: 'p-5 bg-[rgba(5,12,32,0.9)] border border-[#FBF676]/30 rounded-xl',
  cardHighlight: 'p-4 bg-[rgba(251,246,118,0.12)] border-2 border-[#FBF676]/35 rounded-xl',

  label: 'block text-sm font-bold text-[#FBF676] mb-3',
  labelMuted: 'text-sm text-[#FBF676]/80 font-semibold',

  input:
    'w-full px-4 py-3 border border-[#FBF676]/40 rounded-xl bg-[#081028] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FBF676]/40 focus:border-[#FBF676]/70 font-semibold',
  select:
    'w-full px-4 py-3 border border-[#FBF676]/40 rounded-xl bg-[#081028] text-white focus:outline-none focus:ring-2 focus:ring-[#FBF676]/40 focus:border-[#FBF676]/70 font-semibold appearance-none',

  btnPrimary:
    'px-6 py-3 bg-[#FBF676] text-[#0C1A6B] rounded-xl hover:bg-[#e8e04a] font-bold transition-all shadow-lg shadow-[#FBF676]/25 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  btnSecondary:
    'px-6 py-3 border border-[#FBF676]/40 rounded-xl text-[#FBF676] hover:bg-[#FBF676]/10 font-semibold transition-all',

  tableWrap: 'overflow-x-auto',
  table: 'min-w-full divide-y divide-[#FBF676]/15',
  tableHead: 'bg-[rgba(5,12,32,0.9)]',
  tableHeadCell:
    'px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider',
  tableBody: 'bg-[rgba(5,12,32,0.45)] divide-y divide-[#FBF676]/10',
  tableRow: 'hover:bg-[rgba(251,246,118,0.08)] transition-all duration-300 group',

  badgeActive:
    'bg-[rgba(251,246,118,0.15)] text-[#FBF676] border-[#FBF676]/40',
  badgePending: 'bg-white/10 text-white/70 border-white/20',
  badgeError: 'bg-red-900/40 text-red-400 border-red-500/40',

  error:
    'mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm',
  sectionTitle: 'text-2xl font-extrabold text-[#FBF676]',
  accentBar: 'w-1 h-6 rounded',
  accentBarStyle: { background: 'linear-gradient(180deg, #FBF676, #05627C)' } as const,
} as const;
