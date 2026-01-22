'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

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

export default function AdminDashboard() {
  const { user, admin, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Route protection is handled in layout

  useEffect(() => {
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CROWN-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchStatistics();
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


  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="mt-2 text-base text-gray-700">Comprehensive overview of system statistics and analytics</p>
      </div>

        {statistics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Users</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-4">{statistics.totalUsers.toLocaleString()}</p>
                <div className="flex gap-4 text-xs">
                  <span className="bg-white/20 px-3 py-1 rounded-full">Verified: <span className="font-bold">{statistics.verifiedUsers.toLocaleString()}</span></span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">Unverified: <span className="font-bold">{statistics.unverifiedUsers.toLocaleString()}</span></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Investment</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-2">{formatCurrency(statistics.totalInvestment)}</p>
                <p className="text-xs opacity-90 mt-2">Combined deposits and investments</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Withdrawals</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{formatCurrency(statistics.totalWithdrawals)}</p>
              </div>
            </div>

            {/* Additional Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">ROI Earnings</h3>
                  <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(statistics.totalROI)}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Referral Bonus</h3>
                  <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(statistics.totalReferralBonus)}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Binary Bonus</h3>
                  <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(statistics.totalBinaryBonus)}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Deposits</h3>
                  <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(statistics.totalDeposits)}</p>
              </div>
            </div>

            {/* Comprehensive Financial Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Complete Financial Overview</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Investment</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Earnings</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Flow</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  data={[
                    {
                      name: 'Voucher',
                      value: parseFloat(statistics.totalVoucherInvestment),
                      type: 'Investment',
                    },
                    {
                      name: 'Free',
                      value: parseFloat(statistics.totalFreeInvestment),
                      type: 'Investment',
                    },
                    {
                      name: 'Powerleg',
                      value: parseFloat(statistics.totalPowerlegInvestment),
                      type: 'Investment',
                    },
                    {
                      name: 'ROI',
                      value: parseFloat(statistics.totalROI),
                      type: 'Earnings',
                    },
                    {
                      name: 'Referral',
                      value: parseFloat(statistics.totalReferralBonus),
                      type: 'Earnings',
                    },
                    {
                      name: 'Binary',
                      value: parseFloat(statistics.totalBinaryBonus),
                      type: 'Earnings',
                    },
                    {
                      name: 'Deposits & Investment',
                      value: parseFloat(statistics.totalInvestment),
                      type: 'Financial Flow',
                    },
                    {
                      name: 'Withdrawals',
                      value: parseFloat(statistics.totalWithdrawals),
                      type: 'Financial Flow',
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tickFormatter={(value) => {
                      if (value === 0) return '$0';
                      if (value < 1000) return `$${value.toFixed(0)}`;
                      return `$${(value / 1000).toFixed(1)}k`;
                    }}
                  />
                  <Tooltip
                    formatter={(value: number | string | undefined) => {
                      if (value === undefined || value === null) return formatCurrency(0);
                      const numValue = typeof value === 'string' ? parseFloat(value) : value;
                      return formatCurrency(numValue);
                    }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '6px',
                      padding: '10px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  >
                    {[
                      { name: 'Voucher', fill: '#4f46e5' },
                      { name: 'Free', fill: '#6366f1' },
                      { name: 'Powerleg', fill: '#818cf8' },
                      { name: 'ROI', fill: '#10b981' },
                      { name: 'Referral', fill: '#3b82f6' },
                      { name: 'Binary', fill: '#f59e0b' },
                      { name: 'Deposits & Investment', fill: '#059669' },
                      { name: 'Withdrawals', fill: '#ef4444' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Chart Legend Explanation */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    Investment Types
                  </h4>
                  <p className="text-gray-700 text-sm">Voucher, Free, Powerleg investment sources</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Earnings Types
                  </h4>
                  <p className="text-gray-700 text-sm">ROI, Referral, Binary bonus earnings</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Financial Flow
                  </h4>
                  <p className="text-gray-700 text-sm">Total deposits/investments vs withdrawals</p>
                </div>
              </div>
            </div>
          </>
        )}

    </div>
  );
}

