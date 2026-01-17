'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  payCurrency?: string;
  actuallyPaid?: number;
  paymentUrl?: string;
  packageName: string;
  investmentId?: string;
  meta?: any;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AllTransactionsPage() {
  const { admin } = useAuth();
  const [roiTransactions, setRoiTransactions] = useState<Transaction[]>([]);
  const [binaryTransactions, setBinaryTransactions] = useState<Transaction[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<Transaction[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'roi' | 'binary' | 'referral' | 'investment' | 'withdrawal' | 'payment'>('roi');
  
  // Separate counts for each tab
  const [tabCounts, setTabCounts] = useState({
    roi: 0,
    binary: 0,
    referral: 0,
    investment: 0,
    withdrawal: 0,
    payment: 0,
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  
  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  // Fetch transactions for the active tab with pagination
  const fetchTransactions = async (tab: string, pageNum: number, limitNum: number, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');
      const response = await api.getAdminReports({ type: tab, page: pageNum, limit: limitNum });
      
      if (response.data) {
        if (response.data.transactions) {
          // Single type response with pagination
          switch (tab) {
            case 'roi':
              setRoiTransactions(response.data.transactions);
              break;
            case 'binary':
              setBinaryTransactions(response.data.transactions);
              break;
            case 'referral':
              setReferralTransactions(response.data.transactions);
              break;
            case 'investment':
              setInvestmentTransactions(response.data.transactions);
              break;
            case 'withdrawal':
              setWithdrawals(response.data.transactions);
              break;
            case 'payment':
              setPayments(response.data.transactions);
              break;
          }
          
          if (response.data?.pagination) {
            // Always update count for this tab (for UI display) - triggers re-render
            const pagination = response.data.pagination;
            setTabCounts(prev => {
              const newCount = pagination.total;
              
              // Always return new object to ensure React detects the update
              return {
                ...prev,
                [tab]: newCount,
              };
            });
            
            // Only update pagination if this is the active tab
            if (tab === activeTab) {
              setPagination(pagination);
            }
          }
        } else {
          // Fallback: all types response (backward compatibility)
          setRoiTransactions(response.data.roi || []);
          setBinaryTransactions(response.data.binary || []);
          setReferralTransactions(response.data.referral || []);
          setInvestmentTransactions(response.data.investment || []);
          setWithdrawals(response.data.withdrawals || []);
        }
      }
    } catch (err: any) {
      if (showLoading) {
        setError(err.message || 'Failed to load transactions');
      }
      console.error('Error fetching transactions:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Fetch counts for all tabs (background, no loading state)
  const fetchTabCounts = async () => {
    try {
      const tabs: Array<'roi' | 'binary' | 'referral' | 'investment' | 'withdrawal' | 'payment'> = ['roi', 'binary', 'referral', 'investment', 'withdrawal', 'payment'];
      
      // Fetch counts in parallel
      const countPromises = tabs.map(async (tab) => {
        try {
          const response = await api.getAdminReports({ type: tab, page: 1, limit: 1 });
          if (response.data?.pagination?.total !== undefined) {
            return { tab, count: response.data.pagination.total };
          }
          return { tab, count: 0 };
        } catch (err) {
          console.error(`Error fetching count for ${tab}:`, err);
          return { tab, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      // Update counts state - this will trigger UI update
      setTabCounts(prev => {
        const newCounts = { ...prev };
        let hasChanges = false;
        
        results.forEach(({ tab, count }) => {
          if (prev[tab] !== count) {
            newCounts[tab] = count;
            hasChanges = true;
          }
        });
        
        // Always return new object to ensure React detects the change
        // This ensures UI updates even if counts are the same initially
        return newCounts;
      });
    } catch (err) {
      console.error('Error fetching tab counts:', err);
    }
  };

  // Initial load: fetch active tab first, then counts and other tabs in background
  useEffect(() => {
    // Fetch active tab data immediately
    fetchTransactions(activeTab, page, limit, true);
    
    // Fetch counts in background (don't block UI) - runs after initial load
    const countsTimer = setTimeout(() => {
      fetchTabCounts();
    }, 100);
    
    // Load other tabs in background if not already loaded
    const tabs: Array<'roi' | 'binary' | 'referral' | 'investment' | 'withdrawal' | 'payment'> = ['roi', 'binary', 'referral', 'investment', 'withdrawal', 'payment'];
    tabs.forEach((tab) => {
      if (tab !== activeTab && !loadedTabs.has(tab)) {
        // Load first page of each tab in background
        setTimeout(() => {
          fetchTransactions(tab, 1, limit, false).then(() => {
            // Mark tab as loaded after fetch completes
            setLoadedTabs(prev => new Set([...prev, tab]));
          });
        }, 500); // Small delay to not overwhelm the server
      }
    });
    
    return () => {
      clearTimeout(countsTimer);
    };
  }, [activeTab, page, limit]);

  // Update counts when pagination changes for active tab
  useEffect(() => {
    if (pagination.total > 0 && activeTab) {
      setTabCounts(prev => ({
        ...prev,
        [activeTab]: pagination.total,
      }));
    }
  }, [pagination.total, activeTab]);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: 'roi' | 'binary' | 'referral' | 'investment' | 'withdrawal' | 'payment') => {
    setActiveTab(tab);
    setPage(1);
    
    // If tab data is already loaded, update pagination immediately
    // Otherwise it will be loaded by useEffect
    const hasData = 
      (tab === 'roi' && roiTransactions.length > 0) ||
      (tab === 'binary' && binaryTransactions.length > 0) ||
      (tab === 'referral' && referralTransactions.length > 0) ||
      (tab === 'investment' && investmentTransactions.length > 0) ||
      (tab === 'withdrawal' && withdrawals.length > 0) ||
      (tab === 'payment' && payments.length > 0);
    
    if (hasData && tabCounts[tab] > 0) {
      // Update pagination based on loaded data
      const currentDataLength = 
        tab === 'roi' ? roiTransactions.length :
        tab === 'binary' ? binaryTransactions.length :
        tab === 'referral' ? referralTransactions.length :
        tab === 'investment' ? investmentTransactions.length :
        tab === 'withdrawal' ? withdrawals.length :
        payments.length;
      
      setPagination({
        page: 1,
        limit: limit,
        total: tabCounts[tab],
        pages: Math.ceil(tabCounts[tab] / limit),
      });
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
        new Date(tx.createdAt).toLocaleString(),
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
        new Date(tx.createdAt).toLocaleString(),
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
        new Date(wd.createdAt).toLocaleString(),
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

  const getCurrentTransactions = () => {
    switch (activeTab) {
      case 'roi':
        return roiTransactions;
      case 'binary':
        return binaryTransactions;
      case 'referral':
        return referralTransactions;
      case 'investment':
        return investmentTransactions;
      case 'withdrawal':
        return withdrawals;
      default:
        return [];
    }
  };

  const renderTransactionTable = (transactions: Transaction[], title: string) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => exportTransactions(transactions, title)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[160px]">User Email</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[110px]">Balance Before</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[110px]">Balance After</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[130px]" title={tx.userId}>{tx.userId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate max-w-[120px]" title={tx.userName}>{tx.userName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500 truncate max-w-[160px]" title={tx.userEmail}>{tx.userEmail}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">${tx.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">${tx.balanceBefore.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">${tx.balanceAfter.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInvestmentTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Investment Transactions</h3>
        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          {investmentTransactions.length > 0 && (
            <button
              onClick={() => exportInvestmentTransactions(investmentTransactions)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[110px]">Package</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[70px]">ROI</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[110px]">Invested Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investmentTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No investment transactions found
                </td>
              </tr>
            ) : (
              investmentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[130px]" title={tx.userId}>{tx.userId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate max-w-[120px]" title={tx.userName}>{tx.userName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">${tx.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500 truncate max-w-[110px]" title={tx.investment?.packageName || 'N/A'}>{tx.investment?.packageName || 'N/A'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{tx.investment?.roi || 0}%</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">${tx.investment?.investedAmount.toFixed(2) || '0.00'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderWithdrawalTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          {withdrawals.length > 0 && (
            <button
              onClick={() => exportWithdrawals(withdrawals)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Withdrawal ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Charges</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[110px]">Final Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Wallet Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Method</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                  No withdrawals found
                </td>
              </tr>
            ) : (
              withdrawals.map((wd) => (
                <tr key={wd.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{new Date(wd.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[130px]" title={wd.userId}>{wd.userId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate max-w-[120px]" title={wd.userName}>{wd.userName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[120px]" title={wd.withdrawalId || wd.id.substring(0, 8)}>{wd.withdrawalId || wd.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">${wd.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">${wd.charges.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-green-600">${wd.finalAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500 capitalize">{wd.walletType}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500 capitalize">{wd.method || 'crypto'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      wd.status === 'approved' ? 'bg-green-100 text-green-800' :
                      wd.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} withdrawals
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">NOWPayments Transactions</h3>
        <div className="flex items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">User ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">User Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[150px]">Order ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[150px]">Payment ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Package</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Pay Currency</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Actually Paid</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                  No payment transactions found
                </td>
              </tr>
            ) : (
              payments.map((pmt) => (
                <tr key={pmt.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{new Date(pmt.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[130px]" title={pmt.userId}>{pmt.userId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-900 truncate max-w-[120px]" title={pmt.userName}>{pmt.userName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[150px]" title={pmt.orderId}>{pmt.orderId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-gray-600 truncate max-w-[150px]" title={pmt.paymentId}>{pmt.paymentId}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">${pmt.amount.toFixed(2)} {pmt.currency}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500 truncate max-w-[100px]" title={pmt.packageName}>{pmt.packageName}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs text-gray-500">{pmt.payCurrency || 'N/A'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-medium text-gray-900">{pmt.actuallyPaid ? `${pmt.actuallyPaid.toFixed(8)} ${pmt.payCurrency || ''}` : 'N/A'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pmt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      pmt.status === 'pending' || pmt.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pmt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">View all transactions across the system</p>
        </div>
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
              {(['roi', 'binary', 'referral', 'investment', 'withdrawal', 'payment'] as const).map((tab) => {
                // Get count for this specific tab
                const count = tabCounts[tab] || (tab === 'roi' ? roiTransactions.length :
                                                 tab === 'binary' ? binaryTransactions.length :
                                                 tab === 'referral' ? referralTransactions.length :
                                                 tab === 'investment' ? investmentTransactions.length :
                                                 tab === 'withdrawal' ? withdrawals.length :
                                                 payments.length);
                
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                  >
                    {tab} ({count.toLocaleString()})
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'roi' && renderTransactionTable(roiTransactions, 'ROI Transactions')}
        {activeTab === 'binary' && renderTransactionTable(binaryTransactions, 'Binary Bonus Transactions')}
        {activeTab === 'referral' && renderTransactionTable(referralTransactions, 'Referral Bonus Transactions')}
        {activeTab === 'investment' && renderInvestmentTable()}
        {activeTab === 'withdrawal' && renderWithdrawalTable()}
        {activeTab === 'payment' && renderPaymentTable()}
      </div>
    </div>
  );
}

