'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';
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
    <div className={t.tableWrap}>
      <div className="px-4 md:px-6 py-4 border-b border-[#d8e6ec] bg-[#F7FBFC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className={t.sectionTitle}>{title}</h3>
        {showExport && transactions.length > 0 && (
          <button type="button" onClick={() => exportTransactions(transactions, title)} className={t.btnPrimary}>
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className={t.table}>
          <thead className={t.tableHead}>
            <tr>
              <th className={t.tableHeadCell}>Date & Time</th>
              <th className={t.tableHeadCell}>Type</th>
              <th className={t.tableHeadCell}>Amount</th>
              {isReferral && <th className={t.tableHeadCell}>Source</th>}
              <th className={t.tableHeadCell}>Status</th>
              <th className={t.tableHeadCell}>Transaction ID</th>
            </tr>
          </thead>
          <tbody className={t.tableBody}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={isReferral ? 6 : 5} className="px-4 md:px-6 py-10 text-center text-base font-medium" style={{ color: t.muted }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const { date, time } = formatDateTime(tx.createdAt);
                return (
                  <tr key={tx.id} className={t.tableRow}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-bold" style={{ color: t.ink }}>{date}</div>
                      <div className="text-xs mt-0.5" style={{ color: t.muted }}>{time}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${tx.type === 'credit' ? t.badgeActive : t.badgeError}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-extrabold" style={{ color: t.primary }}>
                      ${tx.amount.toFixed(2)}
                    </td>
                    {isReferral && (
                      <td className="px-4 md:px-6 py-4 text-sm">
                        {tx.referralSource && tx.packageInfo ? (
                          <div className="space-y-1">
                            <div className="font-bold" style={{ color: t.ink }}>
                              {tx.referralSource.name}{' '}
                              <span className="font-mono text-xs" style={{ color: t.primary }}>({tx.referralSource.userId})</span>
                            </div>
                            <div className="text-xs" style={{ color: t.muted }}>
                              activated <span className="font-semibold" style={{ color: t.primary }}>${tx.packageInfo.investedAmount.toFixed(2)}</span> package
                            </div>
                            <div className="text-xs" style={{ color: t.muted }}>
                              You got <span className="font-bold" style={{ color: t.primary }}>${tx.amount.toFixed(2)}</span> referral income ({tx.referralPercentage?.toFixed(1) || tx.packageInfo.referralPct?.toFixed(1) || 'N/A'}%)
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-xs" style={{ color: t.muted }}>Source information unavailable</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                        tx.status === 'completed' ? t.badgeActive : tx.status === 'pending' ? t.badgePending : t.badgeError
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold" style={{ color: t.primary }}>
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
  );

  const renderInvestmentTable = () => (
    <div className={t.tableWrap}>
      <div className="px-4 md:px-6 py-4 border-b border-[#d8e6ec] bg-[#F7FBFC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className={t.sectionTitle}>Investment Transactions</h3>
        {investmentTransactions.length > 0 && (
          <button type="button" onClick={() => exportInvestmentTransactions(investmentTransactions)} className={t.btnPrimary}>
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className={t.table}>
          <thead className={t.tableHead}>
            <tr>
              {['Date & Time', 'Type', 'Amount', 'Package', 'ROI %', 'Invested Amount', 'Duration', 'Status', 'Transaction ID'].map((h) => (
                <th key={h} className={t.tableHeadCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={t.tableBody}>
            {investmentTransactions.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-10 text-center font-medium" style={{ color: t.muted }}>No investment transactions found</td></tr>
            ) : (
              investmentTransactions.map((tx) => {
                const { date, time } = formatDateTime(tx.createdAt);
                return (
                  <tr key={tx.id} className={t.tableRow}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-bold" style={{ color: t.ink }}>{date}</div>
                      <div className="text-xs" style={{ color: t.muted }}>{time}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${tx.type === 'credit' ? t.badgeActive : t.badgeError}`}>{tx.type.toUpperCase()}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-extrabold" style={{ color: t.primary }}>${tx.amount.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: t.ink }}>{tx.investment?.packageName || 'N/A'}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.muted }}>{tx.investment?.roi || 0}%</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: t.ink }}>${tx.investment?.investedAmount.toFixed(2) || '0.00'}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.muted }}>{tx.investment?.duration || 0} days</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${tx.status === 'completed' ? t.badgeActive : tx.status === 'pending' ? t.badgePending : t.badgeError}`}>{tx.status}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold" style={{ color: t.primary }}>{tx.txRef || tx.id.substring(0, 8) || 'N/A'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWithdrawalTable = () => (
    <div className={t.tableWrap}>
      <div className="px-4 md:px-6 py-4 border-b border-[#d8e6ec] bg-[#F7FBFC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className={t.sectionTitle}>Withdrawal History</h3>
        {withdrawals.length > 0 && (
          <button type="button" onClick={() => exportWithdrawals(withdrawals)} className={t.btnPrimary}>Export CSV</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className={t.table}>
          <thead className={t.tableHead}>
            <tr>
              {['Date & Time', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Method', 'Status'].map((h) => (
                <th key={h} className={t.tableHeadCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={t.tableBody}>
            {withdrawals.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center font-medium" style={{ color: t.muted }}>No withdrawals found</td></tr>
            ) : (
              withdrawals.map((wd) => {
                const { date, time } = formatDateTime(wd.createdAt);
                return (
                  <tr key={wd.id} className={t.tableRow}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-bold" style={{ color: t.ink }}>{date}</div>
                      <div className="text-xs" style={{ color: t.muted }}>{time}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold" style={{ color: t.primary }}>{wd.withdrawalId || wd.id.substring(0, 8)}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: t.ink }}>${wd.amount.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.muted }}>${wd.charges.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-extrabold" style={{ color: t.primary }}>${wd.finalAmount.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm capitalize font-semibold" style={{ color: t.muted }}>{wd.walletType}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm capitalize font-semibold" style={{ color: t.muted }}>{wd.method || 'crypto'}</td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${wd.status === 'approved' ? t.badgeActive : wd.status === 'pending' ? t.badgePending : t.badgeError}`}>{wd.status}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return <BigBullLoader text="Loading reports…" />;
  }

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>Reports</h1>
        <p className={t.subtitle}>Transaction history across ROI, binary, referral, and more</p>
      </div>

      {error && <div className={t.error}>{error}</div>}

      <div className="border-b border-[#d8e6ec]">
        <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto pb-1">
          {(['roi', 'binary', 'referral', 'careerLevel', 'investment', 'withdrawal'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-2 border-b-2 font-bold text-xs md:text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'border-[#05627C] text-[#05627C]'
                  : 'border-transparent text-[#5A6F78] hover:text-[#05627C] hover:border-[#d8e6ec]'
              }`}
            >
              {tab === 'careerLevel' ? 'Career Level' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {' '}
              ({tab === 'roi' && roiTransactions.length}
              {tab === 'binary' && binaryTransactions.length}
              {tab === 'referral' && referralTransactions.length}
              {tab === 'careerLevel' && careerLevelTransactions.length}
              {tab === 'investment' && investmentTransactions.length}
              {tab === 'withdrawal' && withdrawals.length})
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'roi' && renderTransactionTable(roiTransactions, 'ROI Transactions')}
      {activeTab === 'binary' && renderTransactionTable(binaryTransactions, 'Binary Bonus Transactions')}
      {activeTab === 'referral' && renderTransactionTable(referralTransactions, 'Referral Bonus Transactions', true, true)}
      {activeTab === 'careerLevel' && renderTransactionTable(careerLevelTransactions, 'Career Level Transactions')}
      {activeTab === 'investment' && renderInvestmentTable()}
      {activeTab === 'withdrawal' && renderWithdrawalTable()}
    </div>
  );
}
