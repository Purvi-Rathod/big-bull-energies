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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of system statistics</p>
      </div>

        {statistics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers.toLocaleString()}</p>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="text-gray-600">Verified: <span className="font-semibold text-gray-900">{statistics.verifiedUsers.toLocaleString()}</span></span>
                  <span className="text-gray-600">Unverified: <span className="font-semibold text-gray-900">{statistics.unverifiedUsers.toLocaleString()}</span></span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Deposits & Investment</h3>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(statistics.totalInvestment)}</p>
                <p className="text-xs text-gray-500 mt-2">Combined deposits and investments</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Withdrawals</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalWithdrawals)}</p>
              </div>
            </div>

            {/* Comprehensive Financial Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Financial Overview</h3>
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
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="border-l-4 border-indigo-500 pl-3">
                  <h4 className="font-semibold text-gray-900 mb-1">Investment Types</h4>
                  <p className="text-gray-600">Voucher, Free, Powerleg investment sources</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <h4 className="font-semibold text-gray-900 mb-1">Earnings Types</h4>
                  <p className="text-gray-600">ROI, Referral, Binary bonus earnings</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-3">
                  <h4 className="font-semibold text-gray-900 mb-1">Financial Flow</h4>
                  <p className="text-gray-600">Total deposits/investments vs withdrawals</p>
                </div>
              </div>
            </div>
          </>
        )}

    </div>
  );
}

