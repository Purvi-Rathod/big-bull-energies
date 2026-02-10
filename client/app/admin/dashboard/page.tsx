'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/* Muted Fintech Design Tokens — anchored to steel-blue #3F5E73 */
const tokens = {
  bg: '#F3F4F6',
  bgPanel: '#E9ECEF',
  card: '#FFFFFF',
  cardSecondary: '#F8F9FA',
  primary: '#3F5E73',
  accent: '#5C6B7A',
  accentTeal: '#4A6B5E',
  positive: '#4A6B5E',
  negative: '#6B4F57',
  warning: '#C4A24F',
  border: '#DADDE1',
  track: '#E2E5E9',
  h1: '#1F2933',
  h2: '#27323D',
  label: '#8A9199',
  labelLight: '#9CA3AF',
  subtext: '#8A9199',
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
  const [chartTab, setChartTab] = useState<'Investment' | 'Earnings' | 'Flow'>('Investment');

  // Route protection is handled in layout

  useEffect(() => {
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CROWN-000000';
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
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-[#3F5E73]" />
          <p className="mt-4 text-sm" style={{ color: tokens.label }}>Loading...</p>
        </div>
      </div>
    );
  }

  const chartDataByType = statistics
    ? {
        Investment: [
          { name: 'Voucher', value: parseFloat(statistics.totalVoucherInvestment) },
          { name: 'Free', value: parseFloat(statistics.totalFreeInvestment) },
          { name: 'Powerleg', value: parseFloat(statistics.totalPowerlegInvestment) },
        ],
        Earnings: [
          { name: 'ROI', value: parseFloat(statistics.totalROI) },
          { name: 'Referral', value: parseFloat(statistics.totalReferralBonus) },
          { name: 'Binary', value: parseFloat(statistics.totalBinaryBonus) },
        ],
        Flow: [
          { name: 'Deposits & Investment', value: parseFloat(statistics.totalInvestment) },
          { name: 'Withdrawals', value: parseFloat(statistics.totalWithdrawals) },
        ],
      }
    : { Investment: [], Earnings: [], Flow: [] };
  const chartColors = [tokens.primary, tokens.accent, tokens.accentTeal, tokens.positive, tokens.warning, tokens.negative];

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: tokens.bg, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
      {/* Top Header — command center feel */}
      <header className="sticky top-0 z-10 px-8 flex items-center justify-between" style={{ backgroundColor: tokens.bg, boxShadow: '0 1px 0 ' + tokens.border, paddingTop: 28, paddingBottom: 28 }}>
        <div>
          <h1 className="text-[22px]" style={{ color: tokens.h1, fontWeight: 600 }}>Dashboard</h1>
          <p className="text-[13px] mt-1" style={{ color: tokens.labelLight }}>Comprehensive overview of system statistics and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full text-[13px]" style={{ backgroundColor: tokens.bgPanel, color: tokens.label, border: '1px solid ' + tokens.border }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {/* <button type="button" className="px-4 py-2 rounded-lg text-[13px] border transition-colors" style={{ borderColor: tokens.border, color: tokens.primary }}>Export</button> */}
          <button type="button" className="relative p-2 rounded-lg" style={{ backgroundColor: tokens.bgPanel }}>
            <svg className="w-5 h-5" style={{ color: tokens.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: tokens.warning }} />
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-[1600px] mx-auto" style={{ padding: '32px 40px' }}>
        {/* Section 1 — Daily Business Reports */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold mb-4" style={{ color: tokens.h2 }}>Daily Business Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {[
              { label: "Today's Signups", value: dailySummary?.todaySignups ?? '—', sub: 'Click to view list', onClick: () => setDailyModal('signups'), leftBorder: tokens.primary },
              { label: "Today's Investments", value: dailySummary?.todayInvestmentsCount ?? '—', sub: `$${(dailySummary?.todayInvestmentsAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, href: dailySummary ? `/admin/reports/investments?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/investments', leftBorder: tokens.accent },
              { label: 'Free Account Activations', value: dailySummary?.todayFreeActivations ?? '—', sub: 'Click to view table', onClick: () => setDailyModal('free'), leftBorder: tokens.accentTeal },
              { label: 'Powerleg Activations', value: dailySummary?.todayPowerlegActivations ?? '—', sub: 'Click to view table', onClick: () => setDailyModal('powerleg'), leftBorder: tokens.accent },
              { label: 'Withdraw Requests', value: dailySummary?.todayWithdrawCount ?? '—', sub: 'View table', href: dailySummary ? `/admin/reports/withdrawals?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/withdrawals', leftBorder: tokens.negative },
              { label: 'Withdraw Amount', value: `$${(dailySummary?.todayWithdrawAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: 'View table', href: dailySummary ? `/admin/reports/withdrawals?startDate=${dailySummary.date}&endDate=${dailySummary.date}` : '/admin/reports/withdrawals', leftBorder: tokens.negative },
            ].map((item, i) => {
              const icons = [
                <svg key="users" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
                <svg key="chart" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" /></svg>,
                <svg key="gift" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
                <svg key="network" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
                <svg key="list" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
                <svg key="wallet" className="absolute right-2 top-2 w-14 h-14 opacity-[0.07]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
              ];
              const content = (
                <>
                  <div className="relative">
                    <span className="absolute right-0 top-0 text-[#3F5E73]">{icons[i]}</span>
                    <p className="text-[12px] mb-1" style={{ color: tokens.label, fontWeight: 400 }}>{item.label}</p>
                    <p className="text-2xl" style={{ color: tokens.h1, fontWeight: 600 }}>{item.value}</p>
                    <p className="text-[12px] mt-1" style={{ color: tokens.labelLight, fontWeight: 400 }}>{item.sub}</p>
                  </div>
                </>
              );
              const cardStyle = { backgroundColor: tokens.card, borderLeftColor: item.leftBorder };
              const className = "rounded-[14px] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-offset-2 border-l-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]";
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
            {/* Section 2 — Core Platform Financial Metrics */}
            <section className="mb-8">
              <h2 className="text-[17px] font-semibold mb-5" style={{ color: tokens.h2 }}>Core Platform Financial Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-[14px] p-6 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden" style={{ backgroundColor: tokens.card, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <svg className="absolute right-4 top-4 w-14 h-14 opacity-[0.07]" fill="none" stroke={tokens.primary} strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <p className="text-[13px] mb-2" style={{ color: tokens.label, fontWeight: 400 }}>Total Users</p>
                  <p className="text-[28px]" style={{ color: tokens.h1, fontWeight: 600 }}>{formatNum(statistics.totalUsers)}</p>
                  <div className="flex gap-3 mt-3 text-[12px]" style={{ color: tokens.labelLight, fontWeight: 400 }}>
                    <span>Verified: <strong style={{ color: tokens.h1, fontWeight: 600 }}>{formatNum(statistics.verifiedUsers)}</strong></span>
                    <span>Unverified: <strong style={{ color: tokens.h1, fontWeight: 600 }}>{formatNum(statistics.unverifiedUsers)}</strong></span>
                  </div>
                </div>
                <div className="rounded-[14px] p-6 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden" style={{ backgroundColor: tokens.card, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <svg className="absolute right-4 top-4 w-14 h-14 opacity-[0.07]" fill="none" stroke={tokens.positive} strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[13px] mb-2" style={{ color: tokens.label, fontWeight: 400 }}>Total Investment</p>
                  <p className="text-[28px]" style={{ color: tokens.h1, fontWeight: 600 }}><span className="opacity-70" style={{ fontWeight: 400 }}>$</span>{parseFloat(statistics.totalInvestment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[12px] mt-2" style={{ color: tokens.labelLight, fontWeight: 400 }}>Combined deposits and investments</p>
                </div>
                <div className="rounded-[14px] p-6 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden" style={{ backgroundColor: tokens.card, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <svg className="absolute right-4 top-4 w-14 h-14 opacity-[0.07]" fill="none" stroke={tokens.negative} strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <p className="text-[13px] mb-2" style={{ color: tokens.label, fontWeight: 400 }}>Total Withdrawals</p>
                  <p className="text-[28px]" style={{ color: tokens.h1, fontWeight: 600 }}><span className="opacity-70" style={{ fontWeight: 400 }}>$</span>{parseFloat(statistics.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </section>

            {/* Section 3 — Earnings Breakdown + Section 4 — Total Deposits */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3 rounded-[14px] p-6" style={{ backgroundColor: tokens.card, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h2 className="text-[16px] font-semibold mb-4" style={{ color: tokens.h2 }}>Earnings Breakdown</h2>
                <div className="space-y-5">
                  {[
                    { label: 'ROI Earnings', value: parseFloat(statistics.totalROI), color: tokens.accent },
                    { label: 'Referral Bonus', value: parseFloat(statistics.totalReferralBonus), color: tokens.primary },
                    { label: 'Binary Bonus', value: parseFloat(statistics.totalBinaryBonus), color: tokens.accentTeal },
                  ].map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px]" style={{ color: tokens.label, fontWeight: 400 }}>{row.label}</span>
                        <span className="text-base" style={{ color: tokens.h1, fontWeight: 600 }}><span className="opacity-70" style={{ fontWeight: 400 }}>$</span>{row.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden transition-all duration-500" style={{ backgroundColor: tokens.track }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (row.value / earningsMax) * 100)}%`, backgroundColor: row.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[14px] p-6 flex flex-col justify-center" style={{ backgroundColor: tokens.cardSecondary, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h2 className="text-[16px] font-semibold mb-2" style={{ color: tokens.h2 }}>Total Deposits</h2>
                <p className="text-[28px]" style={{ color: tokens.h1, fontWeight: 600 }}><span className="opacity-70" style={{ fontWeight: 400 }}>$</span>{parseFloat(statistics.totalDeposits).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[12px] mt-1" style={{ color: tokens.labelLight, fontWeight: 400 }}>Visually linked to flow</p>
              </div>
            </div>

            {/* UX Insight chip — institutional analytics feel */}
            {parseFloat(statistics.totalReferralBonus) >= Math.max(parseFloat(statistics.totalROI), parseFloat(statistics.totalBinaryBonus)) && parseFloat(statistics.totalReferralBonus) > 0 && (
              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full w-fit text-[11px]" style={{ backgroundColor: 'rgba(196,162,79,0.08)', border: '1px solid ' + tokens.warning }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-80" style={{ color: tokens.warning }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span style={{ color: tokens.warning }}>Referral bonuses are the highest contributing earning source for this period.</span>
              </div>
            )}

            {/* Section 5 — Financial Overview Chart (Tabbed) */}
            <section className="rounded-[14px] p-6 mb-8" style={{ backgroundColor: tokens.card, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[17px] font-semibold" style={{ color: tokens.h2 }}>Financial Overview</h2>
                <div className="flex gap-0 border-b" style={{ borderColor: tokens.border }}>
                  {(['Investment', 'Earnings', 'Flow'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setChartTab(tab)}
                      className="px-4 py-2.5 text-[13px] relative transition-colors duration-200"
                      style={{ color: chartTab === tab ? tokens.h1 : tokens.label, fontWeight: chartTab === tab ? 600 : 400 }}
                    >
                      {tab}
                      {chartTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-250" style={{ height: 2, backgroundColor: tokens.primary }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={chartDataByType[chartTab]} margin={{ top: 16, right: 24, left: 16, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} />
                  <XAxis dataKey="name" stroke={tokens.label} angle={-35} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis stroke={tokens.label} tickFormatter={(v) => (v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`)} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: unknown) => formatCurrency(Number(v))}
                    contentStyle={{ backgroundColor: tokens.card, border: '1px solid ' + tokens.border, borderRadius: 12, padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    labelStyle={{ color: tokens.h2 }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartDataByType[chartTab].map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          </>
        )}
      </main>

      {/* Daily Business modals */}
      {dailyModal && dailySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setDailyModal(null)}>
          <div className="rounded-[14px] shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: tokens.card, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
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
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(u.createdAt).toLocaleString()}</td>
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
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(r.createdAt).toLocaleString()}</td>
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
                          <td className="py-2" style={{ color: tokens.label }}>{new Date(r.createdAt).toLocaleString()}</td>
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

