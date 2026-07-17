'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import CrownLoader from '@/components/CrownLoader';
import { formatDateTimeUK, formatDateTimeForExportUK } from '@/lib/utils';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  txRef?: string;
  meta?: any;
  createdAt: string;
  investment?: {
    id: string;
    packageName: string;
    roi: number;
    duration: number;
    investedAmount: number;
    type: string;
    createdAt: string;
  } | null;
  referralSource?: {
    userId: string;
    name: string;
  } | null;
  packageInfo?: {
    packageName: string;
    referralPct: number;
    investedAmount: number;
  } | null;
  referralPercentage?: number | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  status: string;
  method: string;
  withdrawalId?: string;
  createdAt: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [roiTransactions, setRoiTransactions] = useState<Transaction[]>([]);
  const [binaryTransactions, setBinaryTransactions] = useState<Transaction[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<Transaction[]>([]);
  const [careerLevelTransactions, setCareerLevelTransactions] = useState<Transaction[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'roi' | 'binary' | 'referral' | 'careerLevel' | 'investment' | 'withdrawal'>('roi');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchReports();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getUserReports();
      if (response.data) {
        setRoiTransactions(response.data.roi || []);
        setBinaryTransactions(response.data.binary || []);
        setReferralTransactions(response.data.referral || []);
        setCareerLevelTransactions(response.data.careerLevel || []);
        setInvestmentTransactions(response.data.investment || []);
        setWithdrawals(response.data.withdrawals || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string, headers: string[], getRow: (item: any) => string[]) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(item => getRow(item).map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactions = (transactions: Transaction[], title: string) => {
    exportToCSV(
      transactions,
      title.toLowerCase().replace(/\s+/g, '_'),
      ['Date & Time', 'Type', 'Amount', 'Status', 'Transaction ID'],
      (tx) => [
        formatDateTimeForExport(tx.createdAt),
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
        tx.status,
        tx.txRef || tx.id.substring(0, 8) || 'N/A'
      ]
    );
  };

  const exportInvestmentTransactions = (transactions: Transaction[]) => {
    exportToCSV(
      transactions,
      'investment_transactions',
      ['Date & Time', 'Type', 'Amount', 'Package Name', 'ROI %', 'Duration (days)', 'Invested Amount', 'Investment Type', 'Status', 'Transaction ID'],
      (tx) => [
        formatDateTimeForExport(tx.createdAt),
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
        tx.investment?.packageName || 'N/A',
        tx.investment?.roi?.toString() || '0',
        tx.investment?.duration?.toString() || '0',
        `$${tx.investment?.investedAmount.toFixed(2) || '0.00'}`,
        tx.investment?.type || 'N/A',
        tx.status,
        tx.txRef || tx.id.substring(0, 8) || 'N/A'
      ]
    );
  };

  const exportWithdrawals = (withdrawals: Withdrawal[]) => {
    exportToCSV(
      withdrawals,
      'withdrawals',
      ['Date & Time', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Method', 'Status'],
      (wd) => [
        formatDateTimeForExport(wd.createdAt),
        wd.withdrawalId || wd.id.substring(0, 8),
        `$${wd.amount.toFixed(2)}`,
        `$${wd.charges.toFixed(2)}`,
        `$${wd.finalAmount.toFixed(2)}`,
        wd.walletType,
        wd.method || 'crypto',
        wd.status
      ]
    );
  };

  const formatDateTime = (dateString: string) => formatDateTimeUK(dateString);
  const formatDateTimeForExport = (dateString: string) => formatDateTimeForExportUK(dateString);

  const renderTransactionTable = (transactions: Transaction[], title: string, showExport: boolean = true, isReferral: boolean = false) => (
    <div className="bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden">
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-yellow-500/20 bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-extrabold text-white">{title}</h3>
        {showExport && transactions.length > 0 && (
          <button
            onClick={() => exportTransactions(transactions, title)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs md:text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-yellow-500/10">
              <thead className="bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Type</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Amount</th>
                  {isReferral && (
                    <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Source</th>
                  )}
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="bg-[#08152F]/50 divide-y divide-yellow-500/10">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={isReferral ? 6 : 5} className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-400 text-base md:text-lg">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const { date, time } = formatDateTime(tx.createdAt);
                    return (
                      <tr key={tx.id} className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group">
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <div className="text-white font-bold group-hover:text-yellow-100 transition-colors">{date}</div>
                          <div className="text-gray-400 text-[10px] md:text-xs mt-1">{time}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <span className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                            tx.type === 'credit' 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20' 
                              : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-extrabold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          ${tx.amount.toFixed(2)}
                        </td>
                        {isReferral && (
                          <td className="px-3 md:px-6 py-3 md:py-5 text-xs md:text-sm">
                            {tx.referralSource && tx.packageInfo ? (
                              <div className="space-y-1 md:space-y-2">
                                <div className="font-bold text-white text-xs md:text-sm">
                                  {tx.referralSource.name} <span className="text-yellow-400 font-mono text-[10px] md:text-xs">({tx.referralSource.userId})</span>
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-400">
                                  activated <span className="text-yellow-400 font-semibold">${tx.packageInfo.investedAmount.toFixed(2)}</span> package
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-300">
                                  You got <span className="text-yellow-400 font-bold">${tx.amount.toFixed(2)}</span> referral income <span className="text-yellow-300">({tx.referralPercentage?.toFixed(1) || tx.packageInfo.referralPct?.toFixed(1) || 'N/A'}%)</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic text-xs">Source information unavailable</span>
                            )}
                          </td>
                        )}
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <span className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                            tx.status === 'completed' 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : tx.status === 'pending' 
                              ? 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                              : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-mono text-yellow-400 font-semibold">
                          {tx.txRef || tx.id.substring(0, 8) || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvestmentTable = () => (
    <div className="bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden">
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-yellow-500/20 bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-extrabold text-white">Investment Transactions</h3>
        {investmentTransactions.length > 0 && (
          <button
            onClick={() => exportInvestmentTransactions(investmentTransactions)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs md:text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-yellow-500/10">
              <thead className="bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Type</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Package</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">ROI %</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Invested Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Duration</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="bg-[#08152F]/50 divide-y divide-yellow-500/10">
                {investmentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-400 text-base md:text-lg">
                      No investment transactions found
                    </td>
                  </tr>
                ) : (
                  investmentTransactions.map((tx) => {
                    const { date, time } = formatDateTime(tx.createdAt);
                    return (
                      <tr key={tx.id} className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group">
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <div className="text-white font-bold group-hover:text-yellow-100 transition-colors">{date}</div>
                          <div className="text-gray-400 text-[10px] md:text-xs mt-1">{time}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <span className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                            tx.type === 'credit' 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20' 
                              : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-extrabold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-white font-bold group-hover:text-yellow-100 transition-colors">
                          {tx.investment?.packageName || 'N/A'}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-300 font-semibold">
                          {tx.investment?.roi || 0}%
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-bold text-white">
                          ${tx.investment?.investedAmount.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-300 font-semibold">
                          {tx.investment?.duration || 0} days
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <span className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                            tx.status === 'completed' 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : tx.status === 'pending' 
                              ? 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                              : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-mono text-yellow-400 font-semibold">
                          {tx.txRef || tx.id.substring(0, 8) || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWithdrawalTable = () => (
    <div className="bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden">
      <div className="px-4 md:px-6 py-4 md:py-5 border-b border-yellow-500/20 bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-extrabold text-white">Withdrawal History</h3>
        {withdrawals.length > 0 && (
          <button
            onClick={() => exportWithdrawals(withdrawals)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs md:text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-yellow-500/10">
              <thead className="bg-gradient-to-r from-[#08152F]/80 via-[#0C1A6B]/75 to-[#05627C]/70">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Withdrawal ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Charges</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Final Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Wallet Type</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Method</th>
                  <th className="px-3 md:px-6 py-3 md:py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/50 divide-y divide-yellow-500/10">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-400 text-base md:text-lg">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((wd) => {
                    const { date, time } = formatDateTime(wd.createdAt);
                    return (
                      <tr key={wd.id} className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group">
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <div className="text-white font-bold group-hover:text-yellow-100 transition-colors">{date}</div>
                          <div className="text-gray-400 text-[10px] md:text-xs mt-1">{time}</div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-mono text-yellow-400 font-semibold">
                          {wd.withdrawalId || wd.id.substring(0, 8)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-bold text-white">
                          ${wd.amount.toFixed(2)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-400 font-semibold">
                          ${wd.charges.toFixed(2)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-extrabold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          ${wd.finalAmount.toFixed(2)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-300 capitalize font-semibold">
                          {wd.walletType}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-300 capitalize font-semibold">
                          {wd.method || 'crypto'}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                          <span className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                            wd.status === 'approved' 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : wd.status === 'pending' 
                              ? 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                              : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                            {wd.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <CrownLoader fullScreen />;
  }

  return (
    <div className="w-full  min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">Reports</span>
        </h1>
          </div>
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

      <div>
          {/* Tabs */}
          <div className="mb-6 md:mb-8">
            <div className="border-b border-yellow-500/20">
              <nav className="-mb-px flex space-x-2 md:space-x-8 overflow-x-auto scrollbar-hide pb-1">
                {/* Add scroll padding for mobile */}
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                  {(['roi', 'binary', 'referral', 'careerLevel', 'investment', 'withdrawal'] as const).map((tab) => (
                  <button
                    key={tab}
                      onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                        : 'border-transparent text-gray-400 hover:text-yellow-300 hover:border-yellow-500/50'
                    } whitespace-nowrap py-3 md:py-4 px-2 md:px-1 border-b-2 font-bold text-xs md:text-sm capitalize transition-all duration-200 rounded-t-lg flex-shrink-0 min-w-fit`}
                  >
                      <span className="block md:inline">
                        {tab === 'careerLevel' ? 'Career Level' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                      <span className="ml-1 md:ml-0">
                        {tab === 'roi' && `(${roiTransactions.length})`}
                        {tab === 'binary' && `(${binaryTransactions.length})`}
                        {tab === 'referral' && `(${referralTransactions.length})`}
                        {tab === 'careerLevel' && `(${careerLevelTransactions.length})`}
                        {tab === 'investment' && `(${investmentTransactions.length})`}
                        {tab === 'withdrawal' && `(${withdrawals.length})`}
                      </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

            {/* Content */}
            {activeTab === 'roi' && renderTransactionTable(roiTransactions, 'ROI Transactions')}
            {activeTab === 'binary' && renderTransactionTable(binaryTransactions, 'Binary Bonus Transactions')}
            {activeTab === 'referral' && renderTransactionTable(referralTransactions, 'Referral Bonus Transactions', true, true)}
            {activeTab === 'careerLevel' && renderTransactionTable(careerLevelTransactions, 'Career Level Transactions')}
            {activeTab === 'investment' && renderInvestmentTable()}
            {activeTab === 'withdrawal' && renderWithdrawalTable()}
          </div>
          </div>
        </div>
  );
}
