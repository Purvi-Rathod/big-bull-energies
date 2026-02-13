'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
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
}

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  status: string;
  method: string;
  withdrawalId?: string;
  createdAt: string;
}

export default function AllTransactionsPage() {
  const { admin } = useAuth();
  const [roiTransactions, setRoiTransactions] = useState<Transaction[]>([]);
  const [binaryTransactions, setBinaryTransactions] = useState<Transaction[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<Transaction[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'roi' | 'binary' | 'referral' | 'investment' | 'withdrawal'>('roi');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminReports();
      if (response.data) {
        setRoiTransactions(response.data.roi || []);
        setBinaryTransactions(response.data.binary || []);
        setReferralTransactions(response.data.referral || []);
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
      ['Date', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Status', 'Transaction Ref'],
      (tx) => [
        new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
        tx.userId,
        tx.userName,
        tx.userEmail,
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
        `$${tx.balanceBefore.toFixed(2)}`,
        `$${tx.balanceAfter.toFixed(2)}`,
        tx.status,
        tx.txRef || 'N/A'
      ]
    );
  };

  const exportInvestmentTransactions = (transactions: Transaction[]) => {
    exportToCSV(
      transactions,
      'investment_transactions',
      ['Date', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Package Name', 'ROI %', 'Duration (days)', 'Invested Amount', 'Investment Type', 'Balance Before', 'Balance After', 'Status', 'Investment ID'],
      (tx) => [
        new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
        tx.userId,
        tx.userName,
        tx.userEmail,
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
        tx.investment?.packageName || 'N/A',
        tx.investment?.roi?.toString() || '0',
        tx.investment?.duration?.toString() || '0',
        `$${tx.investment?.investedAmount.toFixed(2) || '0.00'}`,
        tx.investment?.type || 'N/A',
        `$${tx.balanceBefore.toFixed(2)}`,
        `$${tx.balanceAfter.toFixed(2)}`,
        tx.status,
        tx.txRef || 'N/A'
      ]
    );
  };

  const exportWithdrawals = (withdrawals: Withdrawal[]) => {
    exportToCSV(
      withdrawals,
      'withdrawals',
      ['Date', 'User ID', 'User Name', 'User Email', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Method', 'Status'],
      (wd) => [
        new Date(wd.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
        wd.userId,
        wd.userName,
        wd.userEmail,
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

  const renderTransactionTable = (transactions: Transaction[], title: string) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => exportTransactions(transactions, title)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Email</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Balance Before</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Balance After</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-black">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-3 py-3 text-xs text-black">
                    {new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-black">
                    {tx.userId}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {tx.userName}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {tx.userEmail}
                  </td>
                  <td className="px-3 py-3 text-xs">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-black">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    ${tx.balanceBefore.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    ${tx.balanceAfter.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                      tx.status === 'completed' || tx.status === 'approved' || tx.status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm' :
                      tx.status === 'pending' 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm' :
                      tx.status === 'rejected' || tx.status === 'failed' || tx.status === 'suspended' || tx.status === 'blocked'
                        ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm' :
                      tx.status === 'inactive'
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm' :
                        'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInvestmentTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-black">Investment Transactions</h3>
        {investmentTransactions.length > 0 && (
          <button
            onClick={() => exportInvestmentTransactions(investmentTransactions)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Package</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">ROI</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Invested Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investmentTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-black">
                  No investment transactions found
                </td>
              </tr>
            ) : (
              investmentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-3 py-3 text-xs text-black">
                    {new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-black">
                    {tx.userId}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {tx.userName}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-black">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {tx.investment?.packageName || 'N/A'}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {tx.investment?.roi || 0}%
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-black">
                    ${tx.investment?.investedAmount.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-3 py-3 text-xs">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                      tx.status === 'completed' || tx.status === 'approved' || tx.status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm' :
                      tx.status === 'pending' 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm' :
                      tx.status === 'rejected' || tx.status === 'failed' || tx.status === 'suspended' || tx.status === 'blocked'
                        ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm' :
                      tx.status === 'inactive'
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm' :
                        'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWithdrawalTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-black">Withdrawal History</h3>
        {withdrawals.length > 0 && (
          <button
            onClick={() => exportWithdrawals(withdrawals)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Withdrawal ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Charges</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Final Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Wallet Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Method</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-black">
                  No withdrawals found
                </td>
              </tr>
            ) : (
              withdrawals.map((wd) => (
                <tr key={wd.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-xs text-black">
                    {new Date(wd.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-black">
                    {wd.userId}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    {wd.userName}
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-black">
                    {wd.withdrawalId || wd.id.substring(0, 8)}
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-black">
                    ${wd.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-black">
                    ${wd.charges.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-green-600">
                    ${wd.finalAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-xs text-black capitalize">
                    {wd.walletType}
                  </td>
                  <td className="px-3 py-3 text-xs text-black capitalize">
                    {wd.method || 'crypto'}
                  </td>
                  <td className="px-3 py-3 text-xs">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                      wd.status === 'approved' || wd.status === 'active' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm' :
                      wd.status === 'pending' 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm' :
                      wd.status === 'rejected' || wd.status === 'failed' || wd.status === 'suspended' || wd.status === 'blocked'
                        ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm' :
                      wd.status === 'inactive'
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm' :
                        'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm'
                    }`}>
                      {wd.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-black">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">All Transactions</h1>
        <p className="mt-1 text-sm text-black">View all transactions across the system</p>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['roi', 'binary', 'referral', 'investment', 'withdrawal'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-black hover:text-black hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab} {tab === 'roi' && `(${roiTransactions.length})`}
                  {tab === 'binary' && `(${binaryTransactions.length})`}
                  {tab === 'referral' && `(${referralTransactions.length})`}
                  {tab === 'investment' && `(${investmentTransactions.length})`}
                  {tab === 'withdrawal' && `(${withdrawals.length})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'roi' && renderTransactionTable(roiTransactions, 'ROI Transactions')}
        {activeTab === 'binary' && renderTransactionTable(binaryTransactions, 'Binary Bonus Transactions')}
        {activeTab === 'referral' && renderTransactionTable(referralTransactions, 'Referral Bonus Transactions')}
        {activeTab === 'investment' && renderInvestmentTable()}
        {activeTab === 'withdrawal' && renderWithdrawalTable()}
      </div>
    </div>
  );
}

