/** Shared Big Bull Energies member-portal theme (light, high-contrast, responsive) */

export const dashboardTheme = {
  primary: '#05627C',
  accent: '#3FA9C8',
  gold: '#F5CF0B',
  ink: '#0B1F2A',
  muted: '#5A6F78',
  soft: '#E8F5F0',
  softBlue: '#E6F7FB',
  goldSoft: '#FFF9E6',
  border: '#d8e6ec',
  white: '#FFFFFF',

  page: 'mx-auto w-full max-w-7xl min-w-0 space-y-5 sm:space-y-6 md:space-y-8',
  pageInner: 'min-w-0',

  title:
    'text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B1F2A] break-words',
  subtitle: 'mt-1 text-xs sm:text-sm font-medium text-[#5A6F78]',

  card: 'rounded-xl sm:rounded-2xl border border-[#d8e6ec] bg-white p-4 sm:p-6 md:p-8 shadow-sm min-w-0',
  cardInner: 'p-3 sm:p-4 md:p-5 rounded-xl border border-[#d8e6ec] bg-[#F7FBFC] min-w-0',
  cardHighlight:
    'p-3 sm:p-4 rounded-xl border border-[rgba(245,207,11,0.45)] bg-[#FFF9E6] min-w-0',
  cardEmpty:
    'rounded-xl sm:rounded-2xl border border-[#d8e6ec] bg-white p-8 sm:p-10 md:p-12 text-center shadow-sm',

  label: 'block text-sm font-bold text-[#05627C] mb-2',
  labelMuted: 'text-sm font-semibold text-[#5A6F78]',

  input:
    'w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d8e6ec] rounded-xl bg-[#F7FBFC] text-[#0B1F2A] placeholder:text-[#5A6F78]/60 focus:outline-none focus:ring-2 focus:ring-[#3FA9C8]/35 focus:border-[#05627C] font-semibold text-sm sm:text-base',
  select:
    'w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d8e6ec] rounded-xl bg-[#F7FBFC] text-[#0B1F2A] focus:outline-none focus:ring-2 focus:ring-[#3FA9C8]/35 focus:border-[#05627C] font-semibold appearance-none text-sm sm:text-base',

  btnPrimary:
    'inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F5CF0B] text-[#0B1F2A] rounded-xl hover:opacity-90 font-extrabold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto',
  btnSecondary:
    'inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-[#d8e6ec] rounded-xl text-[#05627C] bg-white hover:bg-[#E8F5F0] font-bold transition-all text-sm sm:text-base w-full sm:w-auto',
  btnGhost:
    'inline-flex items-center justify-center px-4 sm:px-6 py-2.5 text-sm font-bold text-[#5A6F78] bg-[#EEF2F5] rounded-xl hover:bg-[#e2e8ec] transition-all w-full sm:w-auto',

  tableWrap:
    'overflow-x-auto -mx-1 sm:mx-0 rounded-xl sm:rounded-2xl border border-[#d8e6ec] bg-white shadow-sm',
  table: 'min-w-[640px] w-full divide-y divide-[#e8f0f3]',
  tableHead: 'bg-[#F7FBFC]',
  tableHeadCell:
    'px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-[10px] sm:text-[11px] font-extrabold text-[#5A6F78] uppercase tracking-wider whitespace-nowrap',
  tableBody: 'bg-white divide-y divide-[#eef4f7]',
  tableRow: 'hover:bg-[#F7FBFC] transition-colors',

  badgeActive: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  badgePending: 'bg-amber-100 text-amber-800 border border-amber-200',
  badgeError: 'bg-red-100 text-red-700 border border-red-200',
  badgeNeutral: 'bg-slate-100 text-slate-600 border border-slate-200',

  error:
    'mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-xl text-sm font-medium break-words',
  sectionTitle: 'text-base sm:text-lg md:text-xl font-extrabold text-[#0B1F2A]',
  accentBar: 'w-1 h-6 rounded',
  accentBarStyle: { background: 'linear-gradient(180deg, #F5CF0B, #05627C)' } as const,

  modalOverlay:
    'fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#0B1F2A]/45 backdrop-blur-sm p-3 sm:p-4',
  modalPanel:
    'relative my-6 sm:my-10 mx-auto w-full max-w-md rounded-2xl border border-[#d8e6ec] bg-white p-4 sm:p-6 shadow-xl max-h-[min(90vh,900px)] overflow-y-auto',
} as const;
