'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  country?: string;
  walletAddress?: string;
  bankAccount?: any;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  status: string;
  method?: string;
  cryptoType?: string;
  withdrawalId?: string;
  createdAt: string;
}

type WalletTypeTab = 'all' | 'roi' | 'referral' | 'career_level' | 'binary' | 'interest';

function AdminWithdrawalsContent() {
  const { user, admin, loading: authLoading } = useAuth();
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 50 });
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Get active tab from URL or default to 'all'
  const tabFromUrl = searchParams.get('tab') as WalletTypeTab | null;
  const [activeTab, setActiveTab] = useState<WalletTypeTab>(
    tabFromUrl && ['all', 'roi', 'referral', 'career_level', 'binary', 'interest'].includes(tabFromUrl)
      ? tabFromUrl
      : 'all'
  );
  
  // Tab counts for each wallet type
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    roi: 0,
    referral: 0,
    career_level: 0,
    binary: 0,
    interest: 0,
  });

  // Route protection is handled in layout

  // Update activeTab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['all', 'roi', 'referral', 'career_level', 'binary', 'interest'].includes(tabFromUrl)) {
      const newTab = tabFromUrl as WalletTypeTab;
      if (newTab !== activeTab) {
        setActiveTab(newTab);
        setPage(1);
      }
    } else if (!tabFromUrl && activeTab !== 'all') {
      router.push(`/admin/withdrawals?tab=all`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CROWN-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchWithdrawals();
      fetchTabCounts();
    }
  }, [page, statusFilter, startDate, endDate, activeTab, user, admin]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAdminWithdrawals({
        page,
        limit: 50,
        status: statusFilter || undefined,
        walletType: activeTab === 'all' ? undefined : activeTab,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response.data) {
        setWithdrawals(response.data.withdrawals || []);
        setPagination(response.data.pagination || { total: 0, pages: 0, limit: 50 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch withdrawals');
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts for all tabs
  const fetchTabCounts = async () => {
    try {
      const walletTypes: WalletTypeTab[] = ['all', 'roi', 'referral', 'career_level', 'binary', 'interest'];
      
      const countPromises = walletTypes.map(async (tab) => {
        try {
          const response = await api.getAdminWithdrawals({
            page: 1,
            limit: 1,
            walletType: tab === 'all' ? undefined : tab,
          });
          return { tab, count: response.data?.pagination?.total || 0 };
        } catch (err) {
          console.error(`Error fetching count for ${tab}:`, err);
          return { tab, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      const newCounts: any = {};
      results.forEach(({ tab, count }) => {
        newCounts[tab] = count;
      });
      setTabCounts(newCounts);
    } catch (err) {
      console.error('Error fetching tab counts:', err);
    }
  };

  const handleTabChange = (tab: WalletTypeTab) => {
    setActiveTab(tab);
    setPage(1);
    router.push(`/admin/withdrawals?tab=${tab}`);
  };

  const handleApprove = async (withdrawalId: string) => {
    const confirmed = await confirm({
      title: 'Approve Withdrawal',
      message: 'Are you sure you want to approve this withdrawal? This will deduct the amount from the user\'s wallet.',
      variant: 'info',
      confirmText: 'Yes, Approve',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setProcessingId(withdrawalId);
      await api.approveWithdrawal(withdrawalId);
      toast.success('Withdrawal approved successfully!');
      // Refresh withdrawals and counts
      setPage(1);
      await fetchWithdrawals();
      await fetchTabCounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve withdrawal');
      console.error('Error approving withdrawal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const confirmed = await confirm({
      title: 'Reject Withdrawal',
      message: 'Are you sure you want to reject this withdrawal? You can provide a reason in the next step.',
      variant: 'warning',
      confirmText: 'Yes, Reject',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    const reason = prompt('Please provide a reason for rejection (optional):');
    
    try {
      setProcessingId(withdrawalId);
      await api.rejectWithdrawal(withdrawalId, reason || undefined);
      toast.success('Withdrawal rejected successfully!');
      // Refresh withdrawals and counts
      setPage(1);
      await fetchWithdrawals();
      await fetchTabCounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject withdrawal');
      console.error('Error rejecting withdrawal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm';
      case 'rejected':
      case 'suspended':
      case 'blocked':
        return 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm';
    }
  };

  if (authLoading) {
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
      <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Withdrawal Management</h1>
        <p className="mt-1 text-sm text-black">Approve or reject withdrawal requests</p>
        </div>

        {/* Wallet Type Tabs */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-2 border-2 border-indigo-200 shadow-lg">
            <nav className="flex space-x-2 flex-wrap">
              {([
                { key: 'all', label: 'All', color: 'from-gray-500 to-gray-600' },
                { key: 'roi', label: 'ROI', color: 'from-green-500 to-emerald-600' },
                { key: 'referral', label: 'Referral', color: 'from-blue-500 to-cyan-600' },
                { key: 'career_level', label: 'Career', color: 'from-purple-500 to-pink-600' },
                { key: 'binary', label: 'Binary', color: 'from-orange-500 to-yellow-600' },
                { key: 'interest', label: 'Interest', color: 'from-indigo-500 to-purple-600' },
              ] as const).map(({ key, label, color }) => {
                const count = tabCounts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={`${
                      activeTab === key
                        ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                        : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                    } whitespace-nowrap py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200`}
                  >
                    {label} ({count.toLocaleString()})
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === '' 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'pending' 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-2 border-yellow-300 hover:from-yellow-100 hover:to-amber-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'approved' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-300 hover:from-green-100 hover:to-emerald-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                statusFilter === 'rejected' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-2 border-red-300 hover:from-red-100 hover:to-pink-100'
              }`}
            >
              Rejected
            </button>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-4 items-center flex-wrap bg-white p-4 rounded-lg shadow border border-gray-200">
            <label className="text-sm font-medium text-black whitespace-nowrap">Date Range:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-black">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-sm"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-black">Loading withdrawals...</p>
          </div>
        )}

        {!loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[140px]">User</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[100px]">Country</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[120px]">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[100px]">Wallet Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[180px]">Wallet Address</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[90px]">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[130px]">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-black">
                        No withdrawals found
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((wd) => (
                      <tr key={wd.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-black truncate max-w-[140px]" title={wd.userName}>{wd.userName}</div>
                          <div className="text-xs text-black truncate max-w-[140px]" title={wd.userId}>{wd.userId}</div>
                          <div className="text-xs text-black truncate max-w-[140px]" title={wd.userEmail}>{wd.userEmail}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">{wd.country || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold text-black">{formatCurrency(wd.amount)}</div>
                          <div className="text-xs text-black">Charges: {formatCurrency(wd.charges)}</div>
                          <div className="text-xs text-black">Final: {formatCurrency(wd.finalAmount)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black capitalize">{wd.walletType}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black font-mono truncate max-w-[180px]" title={wd.walletAddress || wd.bankAccount?.accountNumber || '-'}>
                            {wd.walletAddress || wd.bankAccount?.accountNumber || '-'}
                          </div>
                          {wd.bankAccount && (
                            <div className="text-xs text-black truncate max-w-[180px]" title={`${wd.bankAccount.bankName} - ${wd.bankAccount.accountHolderName}`}>
                              {wd.bankAccount.bankName} - {wd.bankAccount.accountHolderName}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${getStatusColor(wd.status)}`}>
                            {wd.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">{formatDate(wd.createdAt)}</div>
                        </td>
                        <td className="px-3 py-3 text-xs font-medium">
                          {wd.status === 'pending' && (
                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleApprove(wd.id)}
                                disabled={processingId === wd.id}
                                className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded-md hover:bg-green-100 disabled:opacity-50 whitespace-nowrap"
                              >
                                {processingId === wd.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(wd.id)}
                                disabled={processingId === wd.id}
                                className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 disabled:opacity-50 whitespace-nowrap"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {wd.status !== 'pending' && (
                            <span className="text-black">-</span>
                          )}
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
                <div className="text-sm text-black">
                  Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} withdrawals
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default function AdminWithdrawals() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    }>
      <AdminWithdrawalsContent />
    </Suspense>
  );
}

