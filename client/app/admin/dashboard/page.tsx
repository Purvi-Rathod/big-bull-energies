'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Users,
  DollarSign,
  Share2,
  GitBranch,
  Award,
  Wallet,
  UserPlus,
  Building2,
  PiggyBank,
  Rocket,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Calendar,
  Bell,
  Gift,
  Network,
  FileText,
  ArrowDownToLine,
  Coins,
  Target,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';

/* Colorful dashboard theme — white bg, black text, highlight #19ebf3 + rich accents */
const HIGHLIGHT = '#19ebf3';
const tokens = {
  bg: '#F8FAFC',
  bgPanel: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: HIGHLIGHT,
  accent: '#0eb8c4',
  accentTeal: '#14b8a6',
  positive: '#059669',
  negative: '#DC2626',
  warning: '#F59E0B',
  border: '#E2E8F0',
  track: '#E2E8F0',
  h1: '#0F172A',
  h2: '#1E293B',
  label: '#64748B',
  labelLight: '#94A3B8',
  subtext: '#64748B',
  violet: '#8B5CF6',
  indigo: '#6366F1',
  sky: '#0EA5E9',
  emerald: '#10B981',
  amber: '#F59E0B',
};

interface Statistics {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalDeposits: string;
  totalWithdrawals: string;
  totalInvestment: string;
  totalVoucherInvestment: string;
  totalFreeInvestment: string;
  totalPowerlegInvestment: string;
  totalROI: string;
  totalReferralBonus: string;
  totalBinaryBonus: string;
  totalReferralWithdrawalPaid: string;
  totalBinaryWithdrawalPaid: string;
  totalCareerWithdrawalPaid: string;
  totalROIWithdrawalPaid: string;
  freeInvestmentCount: number;
  powerlegAccountCount: number;
}

interface DailySummary {
  date: string;
  todaySignups: number;
  signupsList: Array<{ userId: string; name: string; email: string; country: string; createdAt: string }>;
  todayInvestmentsCount: number;
  todayInvestmentsAmount: number;
  todayFreeActivations: number;
  freeList: Array<{ id: string; userId: string; userName: string; userEmail: string; packageName: string; investedAmount: number; createdAt: string }>;
  todayPowerlegActivations: number;
  powerlegList: Array<{ id: string; userId: string; userName: string; userEmail: string; packageName: string; investedAmount: number; createdAt: string }>;
  todayWithdrawCount: number;
  todayWithdrawAmount: number;
  withdrawalsList: Array<{ id: string; userId: string; userName: string; userEmail: string; amount: number; status: string; walletType: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const { user, admin, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyModal, setDailyModal] = useState<'signups' | 'free' | 'powerleg' | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'This Week' | 'This Month' | 'This Quarter'>('This Month');

  // Route protection is handled in layout

  useEffect(() => {
    const isAdminUser = user?.userId === 'BIGBULL-000000' || user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchStatistics();
      fetchDailySummary();
    }
  }, [user, admin]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAdminStatistics();
      if (response.data) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.getDailyBusinessSummary(today);
      if (response.data) {
        setDailySummary(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching daily summary:', err);
    }
  };


  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatNum = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  const totalInvestNum = statistics ? parseFloat(statistics.totalInvestment) : 0;
  const earningsMax = Math.max(
    parseFloat(statistics?.totalROI ?? '0'),
    parseFloat(statistics?.totalReferralBonus ?? '0'),
    parseFloat(statistics?.totalBinaryBonus ?? '0'),
    1
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" style={{ backgroundColor: tokens.bg }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-transparent" style={{ borderTopColor: HIGHLIGHT }} />
          <p className="mt-4 text-sm" style={{ color: tokens.label }}>Loading...</p>
        </div>
      </div>
    );
  }

  /* Dashboard KPIs — icon + color per card */
  const kpiCards = statistics
    ? [
        { value: formatNum(statistics.totalUsers), label: 'Total signups', icon: Users, color: tokens.primary, bg: '#E0F7FA' },
        { value: formatCurrency(statistics.totalDeposits), label: 'Total cash business ', icon: DollarSign, color: tokens.emerald, bg: '#D1FAE5' },
        { value: formatCurrency(statistics.totalReferralWithdrawalPaid ?? '0'), label: 'Total referral withdrawal paid ', icon: Share2, color: tokens.violet, bg: '#EDE9FE' },
        { value: formatCurrency(statistics.totalBinaryWithdrawalPaid ?? '0'), label: 'Total binary withdrawal paid ', icon: GitBranch, color: tokens.indigo, bg: '#E0E7FF' },
        { value: formatCurrency(statistics.totalCareerWithdrawalPaid ?? '0'), label: 'Total career withdrawal paid ', icon: Award, color: tokens.amber, bg: '#FEF3C7' },
        { value: formatCurrency(statistics.totalROIWithdrawalPaid ?? '0'), label: 'Total ROI withdrawal paid ', icon: Wallet, color: tokens.sky, bg: '#E0F2FE' },
        { value: formatNum(statistics.freeInvestmentCount ?? 0), label: 'Number of free investment accounts', icon: UserPlus, color: tokens.accentTeal, bg: '#CCFBF1' },
        { value: formatNum(statistics.powerlegAccountCount ?? 0), label: 'Total number of powerleg accounts', icon: Building2, color: tokens.violet, bg: '#EDE9FE' },
        { value: formatCurrency(statistics.totalFreeInvestment), label: 'Total free investment done', icon: PiggyBank, color: tokens.positive, bg: '#D1FAE5' },
        { value: formatCurrency(statistics.totalPowerlegInvestment), label: 'Total powerleg investment given', icon: Rocket, color: HIGHLIGHT, bg: '#CFFAFE' },
      ]
    : [];

  /* Line chart: distribute totals across 7 days for trend visualization */
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const investmentShare = [0.1, 0.12, 0.18, 0.22, 0.18, 0.12, 0.08];
  const withdrawalShare = [0.08, 0.14, 0.2, 0.24, 0.18, 0.1, 0.06];
  const lineChartData = statistics
    ? days.map((day, i) => {
        const totalInv = parseFloat(statistics.totalInvestment) || 0;
        const totalWd = parseFloat(statistics.totalWithdrawals) || 0;
        return {
          day,
          investment: Math.round((totalInv * investmentShare[i]) / 100) * 100 || totalInv / 7,
          withdrawals: Math.round((totalWd * withdrawalShare[i]) / 100) * 100 || totalWd / 7,
        };
      })
    : [];
  const lineChartTotal = lineChartData.reduce((s, d) => s + d.investment + d.withdrawals, 0);
  const lineChartInvestmentSum = lineChartData.reduce((s, d) => s + d.investment, 0);
  const lineChartWithdrawalSum = lineChartData.reduce((s, d) => s + d.withdrawals, 0);
  const totalProgressPercent = lineChartTotal > 0 ? (lineChartInvestmentSum / lineChartTotal) * 100 : 0;
  const yAxisMax = lineChartData.length
    ? Math.max(...lineChartData.flatMap((d) => [d.investment, d.withdrawals]), 1) * 1.15
    : 100;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: tokens.bg, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
      {/* Top Header with logo and icons */}
      <header
        className="sticky top-0 z-10 px-8 flex items-center justify-between border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: tokens.border,
          paddingTop: 20,
          paddingBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(25,235,243,0.15)', border: '1px solid rgba(25,235,243,0.3)' }}>
            <Image src="/image.png" alt="Big Bull" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <h1 className="text-[22px] flex items-center gap-2" style={{ color: tokens.h1, fontWeight: 700 }}>
              <LayoutDashboard className="w-6 h-6" style={{ color: tokens.primary }} />
              Dashboard
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: tokens.labelLight }}>Overview of system statistics and analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium" style={{ backgroundColor: tokens.bgPanel, color: tokens.label, border: '1px solid ' + tokens.border }}>
            <Calendar className="w-4 h-4" style={{ color: tokens.primary }} />
            {new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Europe/London' })}
          </span>
          <button
            type="button"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors hover:opacity-90"
            style={{ backgroundColor: tokens.bgPanel, color: tokens.label, border: '1px solid ' + tokens.border }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: tokens.warning }} />
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-[1600px] mx-auto" style={{ padding: '32px 40px' }}>
        {/* KPI Cards — 10 metrics with icons and colors (5 + 5 grid) */}
        {kpiCards.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold mb-5" style={{ color: tokens.h2 }}>
              <TrendingUp className="w-5 h-5" style={{ color: tokens.primary }} />
              Key metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
              {kpiCards.slice(0, 5).map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl p-5 text-left transition-all duration-200 border shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      backgroundColor: tokens.card,
                      borderColor: kpi.color + '30',
                      borderLeftWidth: 4,
                      borderLeftColor: kpi.color,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: kpi.bg }}>
                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-3" style={{ color: tokens.h1 }}>{kpi.value}</p>
                    <p className="text-sm mt-1 leading-snug" style={{ color: tokens.label }}>{kpi.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 mt-4 lg:mt-5">
              {kpiCards.slice(5, 10).map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={i + 5}
                    className="rounded-xl p-5 text-left transition-all duration-200 border shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      backgroundColor: tokens.card,
                      borderColor: kpi.color + '30',
                      borderLeftWidth: 4,
                      borderLeftColor: kpi.color,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: kpi.bg }}>
                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold mt-3" style={{ color: tokens.h1 }}>{kpi.value}</p>
                    <p className="text-sm mt-1 leading-snug" style={{ color: tokens.label }}>{kpi.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section — Daily Business Reports */}
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold mb-4" style={{ color: tokens.h2 }}>
            <FileText className="w-5 h-5" style={{ color: tokens.primary }} />
            Daily Business Reports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {[
              { label: "Today's Signups", value: dailySummary?.todaySignups ?? '—', sub: 'Click to view list', onClick: () => setDailyModal('signups'), leftBorder: tokens.primary, icon: Users, iconBg: '#E0F7FA' },
              { label: "Today's Investments", value: dailySummary?.todayInvestmentsCount ?? '—', sub: `$${(dailySummary?.todayInvestmentsAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, href: dailySummary ? `/admin/reports/investments?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/investments', leftBorder: tokens.accent, icon: Coins, iconBg: '#D1FAE5' },
              { label: 'Free Account Activations', value: dailySummary?.todayFreeActivations ?? '—', sub: 'Click to view table', onClick: () => setDailyModal('free'), leftBorder: tokens.accentTeal, icon: Gift, iconBg: '#CCFBF1' },
              { label: 'Powerleg Activations', value: dailySummary?.todayPowerlegActivations ?? '—', sub: 'Click to view table', onClick: () => setDailyModal('powerleg'), leftBorder: tokens.indigo, icon: Network, iconBg: '#E0E7FF' },
              { label: 'Withdraw Requests', value: dailySummary?.todayWithdrawCount ?? '—', sub: 'View table', href: dailySummary ? `/admin/reports/withdrawals?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/withdrawals', leftBorder: tokens.negative, icon: ArrowDownToLine, iconBg: '#FEE2E2' },
              { label: 'Withdraw Amount', value: `$${(dailySummary?.todayWithdrawAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'View table', href: dailySummary ? `/admin/reports/withdrawals?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/withdrawals', leftBorder: tokens.negative, icon: Wallet, iconBg: '#FEE2E2' },
            ].map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div className="relative flex flex-col">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: item.iconBg }}>
                    <Icon className="w-4 h-4" style={{ color: item.leftBorder }} />
                  </div>
                  <p className="text-[12px] mb-1 font-medium" style={{ color: tokens.label }}>{item.label}</p>
                  <p className="text-2xl font-bold" style={{ color: tokens.h1 }}>{item.value}</p>
                  <p className="text-[12px] mt-1" style={{ color: tokens.labelLight }}>{item.sub}</p>
                </div>
              );
              const cardStyle = { backgroundColor: tokens.card, borderLeftColor: item.leftBorder, border: '1px solid ' + tokens.cardBorder };
              const className = "rounded-xl p-5 text-left transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#19ebf3] focus:ring-offset-2 border-l-4 focus:ring-offset-white";
              if (item.href) {
                return (
                  <Link key={i} href={item.href} className={`block ${className}`} style={cardStyle}>
                    {content}
                  </Link>
                );
              }
              return (
                <button key={i} type="button" onClick={item.onClick} className={className} style={cardStyle}>
                  {content}
                </button>
              );
            })}
          </div>
        </section>

        {statistics && (
          <>
            {/* Section — Core Platform Financial Metrics */}
            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold mb-5" style={{ color: tokens.h2 }}>
                <Target className="w-5 h-5" style={{ color: tokens.primary }} />
                Core Platform Financial Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl p-6 transition-all duration-200 relative overflow-hidden border-l-4 shadow-sm hover:shadow-md" style={{ backgroundColor: tokens.card, borderColor: tokens.primary + '40', borderLeftColor: tokens.primary }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#E0F7FA' }}>
                    <Users className="w-6 h-6" style={{ color: tokens.primary }} />
                  </div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: tokens.label }}>Total Users</p>
                  <p className="text-[28px] font-bold" style={{ color: tokens.h1 }}>{formatNum(statistics.totalUsers)}</p>
                  <div className="flex gap-3 mt-3 text-[12px]" style={{ color: tokens.labelLight }}>
                    <span>Verified: <strong style={{ color: tokens.h1 }}>{formatNum(statistics.verifiedUsers)}</strong></span>
                    <span>Unverified: <strong style={{ color: tokens.h1 }}>{formatNum(statistics.unverifiedUsers)}</strong></span>
                  </div>
                </div>
                <div className="rounded-xl p-6 transition-all duration-200 relative overflow-hidden border-l-4 shadow-sm hover:shadow-md" style={{ backgroundColor: tokens.card, borderColor: tokens.positive + '40', borderLeftColor: tokens.positive }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                    <DollarSign className="w-6 h-6" style={{ color: tokens.positive }} />
                  </div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: tokens.label }}>Total Investment</p>
                  <p className="text-[28px] font-bold" style={{ color: tokens.h1 }}><span className="opacity-70">$</span>{parseFloat(statistics.totalInvestment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[12px] mt-2" style={{ color: tokens.labelLight }}>Combined deposits and investments</p>
                </div>
                <div className="rounded-xl p-6 transition-all duration-200 relative overflow-hidden border-l-4 shadow-sm hover:shadow-md" style={{ backgroundColor: tokens.card, borderColor: tokens.negative + '40', borderLeftColor: tokens.negative }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#FEE2E2' }}>
                    <ArrowDownToLine className="w-6 h-6" style={{ color: tokens.negative }} />
                  </div>
                  <p className="text-[13px] mb-2 font-medium" style={{ color: tokens.label }}>Total Withdrawals</p>
                  <p className="text-[28px] font-bold" style={{ color: tokens.h1 }}><span className="opacity-70">$</span>{parseFloat(statistics.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </section>

            {/* Section — Earnings Breakdown + Total Deposits */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3 rounded-xl p-6 border shadow-sm" style={{ backgroundColor: tokens.card, borderColor: tokens.cardBorder }}>
                <h2 className="flex items-center gap-2 text-[16px] font-semibold mb-4" style={{ color: tokens.h2 }}>
                  <Coins className="w-5 h-5" style={{ color: tokens.amber }} />
                  Earnings Breakdown
                </h2>
                <div className="space-y-5">
                  {[
                    { label: 'ROI Earnings', value: parseFloat(statistics.totalROI), color: tokens.sky, icon: Wallet },
                    { label: 'Referral Bonus', value: parseFloat(statistics.totalReferralBonus), color: tokens.primary, icon: Share2 },
                    { label: 'Binary Bonus', value: parseFloat(statistics.totalBinaryBonus), color: tokens.accentTeal, icon: GitBranch },
                  ].map((row, i) => {
                    const RowIcon = row.icon;
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="flex items-center gap-2 text-[13px]" style={{ color: tokens.label }}>
                            <RowIcon className="w-4 h-4" style={{ color: row.color }} />
                            {row.label}
                          </span>
                          <span className="text-base font-semibold" style={{ color: tokens.h1 }}><span className="opacity-70">$</span>{row.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden transition-all duration-500" style={{ backgroundColor: tokens.track }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (row.value / earningsMax) * 100)}%`, backgroundColor: row.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl p-6 flex flex-col justify-center border-l-4 shadow-sm" style={{ backgroundColor: '#F0FDFA', borderColor: tokens.primary + '40', borderLeftColor: tokens.primary }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#E0F7FA' }}>
                  <PiggyBank className="w-6 h-6" style={{ color: tokens.primary }} />
                </div>
                <h2 className="text-[16px] font-semibold mb-2" style={{ color: tokens.h2 }}>Total Deposits</h2>
                <p className="text-[28px] font-bold" style={{ color: tokens.h1 }}><span className="opacity-70">$</span>{parseFloat(statistics.totalDeposits).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[12px] mt-1" style={{ color: tokens.labelLight }}>All-time deposit total</p>
              </div>
            </div>

            {/* UX Insight chip */}
            {parseFloat(statistics.totalReferralBonus) >= Math.max(parseFloat(statistics.totalROI), parseFloat(statistics.totalBinaryBonus)) && parseFloat(statistics.totalReferralBonus) > 0 && (
              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full w-fit text-[11px]" style={{ backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid ' + tokens.warning }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-80" style={{ color: tokens.warning }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span style={{ color: tokens.warning }}>Referral bonuses are the highest contributing earning source for this period.</span>
              </div>
            )}

            {/* Section — Financial Overview (Line chart) */}
            <section className="rounded-xl p-6 mb-8 border shadow-sm" style={{ backgroundColor: tokens.card, borderColor: tokens.cardBorder }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <h2 className="flex items-center gap-2 text-[17px] font-bold" style={{ color: tokens.h1 }}>
                    <BarChart3 className="w-5 h-5" style={{ color: tokens.primary }} />
                    Financial Overview
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.label }}>
                      <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: tokens.primary, backgroundColor: 'white' }} />
                      {chartPeriod} — Investment
                      <span className="font-semibold" style={{ color: tokens.h1 }}>{formatCurrency(lineChartInvestmentSum)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-medium" style={{ color: tokens.label }}>
                      <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: tokens.violet, backgroundColor: 'white' }} />
                      {chartPeriod} — Withdrawals
                      <span className="font-semibold" style={{ color: tokens.h1 }}>{formatCurrency(lineChartWithdrawalSum)}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value as 'This Week' | 'This Month' | 'This Quarter')}
                    className="text-sm font-medium rounded-lg border pl-3 pr-8 py-2 appearance-none bg-no-repeat cursor-pointer"
                    style={{
                      color: tokens.h1,
                      borderColor: tokens.border,
                      backgroundColor: tokens.bgPanel,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.25rem',
                    }}
                  >
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Quarter">This Quarter</option>
                  </select>
                  <button
                    type="button"
                    className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors hover:opacity-80"
                    style={{ backgroundColor: tokens.bgPanel, borderColor: tokens.border, color: tokens.label }}
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: tokens.label }}>Total</span>
                  <span className="text-base font-bold" style={{ color: tokens.h1 }}>{formatCurrency(lineChartTotal)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: tokens.track }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${totalProgressPercent}%`, backgroundColor: tokens.primary }}
                  />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid ' + tokens.border }}>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={lineChartData} margin={{ top: 20, right: 20, left: 12, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: tokens.label }}
                      axisLine={{ stroke: tokens.border }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, yAxisMax]}
                      tick={{ fontSize: 12, fill: tokens.label }}
                      tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: unknown) => formatCurrency(Number(v))}
                      contentStyle={{
                        backgroundColor: tokens.card,
                        border: '1px solid ' + tokens.border,
                        borderRadius: 12,
                        padding: '12px 16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                      labelStyle={{ color: tokens.h2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="investment"
                      name="Investment"
                      stroke={tokens.primary}
                      strokeWidth={2.5}
                      dot={{ fill: '#FFFFFF', stroke: tokens.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: '#FFFFFF', stroke: tokens.primary, strokeWidth: 2, r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="withdrawals"
                      name="Withdrawals"
                      stroke={tokens.violet}
                      strokeWidth={2.5}
                      dot={{ fill: '#FFFFFF', stroke: tokens.violet, strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: '#FFFFFF', stroke: tokens.violet, strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Daily Business modals */}
      {dailyModal && dailySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDailyModal(null)}>
          <div className="rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border" style={{ backgroundColor: tokens.card, borderColor: tokens.cardBorder }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid ' + tokens.border }}>
              <h3 className="text-[17px] font-semibold" style={{ color: tokens.h1 }}>
                {dailyModal === 'signups' && `Today's Signups (${dailySummary.signupsList.length})`}
                {dailyModal === 'free' && `Today's Free Account Activations (${dailySummary.freeList.length})`}
                {dailyModal === 'powerleg' && `Today's Powerleg Activations (${dailySummary.powerlegList.length})`}
              </h3>
              <button type="button" onClick={() => setDailyModal(null)} className="text-2xl leading-none transition-colors" style={{ color: tokens.label }}>&times;</button>
            </div>
            <div className="overflow-auto flex-1 p-6">
              {dailyModal === 'signups' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-semibold" style={{ borderBottom: '1px solid ' + tokens.border, color: tokens.h2 }}>
                      <th className="pb-2 pr-4">User ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Country</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySummary.signupsList.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center" style={{ color: tokens.subtext }}>No signups today</td></tr>
                    ) : (
                      dailySummary.signupsList.map((u) => (
                        <tr key={u.userId} style={{ borderBottom: '1px solid ' + tokens.border }}>
                          <td className="py-2 pr-4 font-mono" style={{ color: tokens.h1 }}>{u.userId}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{u.name}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{u.email}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{u.country}</td>
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(u.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
              {dailyModal === 'free' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-semibold" style={{ borderBottom: '1px solid ' + tokens.border, color: tokens.h2 }}>
                      <th className="pb-2 pr-4">User ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Package</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySummary.freeList.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center" style={{ color: tokens.subtext }}>No free activations today</td></tr>
                    ) : (
                      dailySummary.freeList.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid ' + tokens.border }}>
                          <td className="py-2 pr-4 font-mono" style={{ color: tokens.h1 }}>{r.userId}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{r.userName}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{r.packageName}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>${r.investedAmount.toFixed(2)}</td>
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(r.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
              {dailyModal === 'powerleg' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-semibold" style={{ borderBottom: '1px solid ' + tokens.border, color: tokens.h2 }}>
                      <th className="pb-2 pr-4">User ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Package</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySummary.powerlegList.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center" style={{ color: tokens.subtext }}>No powerleg activations today</td></tr>
                    ) : (
                      dailySummary.powerlegList.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid ' + tokens.border }}>
                          <td className="py-2 pr-4 font-mono" style={{ color: tokens.h1 }}>{r.userId}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{r.userName}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>{r.packageName}</td>
                          <td className="py-2 pr-4" style={{ color: tokens.h1 }}>${r.investedAmount.toFixed(2)}</td>
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(r.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

