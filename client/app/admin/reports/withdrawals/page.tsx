'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminUserSearchInput, { getEffectiveUserSearch } from '@/components/AdminUserSearchInput';

export default function WithdrawalsReportPage() {
  const searchParams = useSearchParams();
  const urlStart = searchParams.get('startDate') ?? '';
  const urlEnd = searchParams.get('endDate') ?? '';

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUseCrownPrefix, setSearchUseCrownPrefix] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'completed' | 'failed'>('all');
  const [walletTypeFilter, setWalletTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState(urlStart);
  const [endDate, setEndDate] = useState(urlEnd);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (urlStart) setStartDate(urlStart);
    if (urlEnd) setEndDate(urlEnd);
  }, [urlStart, urlEnd]);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getWithdrawalsReport();
      if (response.data) {
        setReport(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
      toast.error(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredWithdrawals = () => {
    if (!report?.withdrawals) return [];
    
    let filtered = [...report.withdrawals];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const effectiveTerm = getEffectiveUserSearch(searchTerm, searchUseCrownPrefix).toLowerCase();
      filtered = filtered.filter((wd: any) =>
        wd.userId.toLowerCase().includes(effectiveTerm) ||
        wd.userName.toLowerCase().includes(term) ||
        wd.userEmail.toLowerCase().includes(term) ||
        (wd.withdrawalId && wd.withdrawalId.toLowerCase().includes(term))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((wd: any) => wd.status === statusFilter);
    }
    
    if (walletTypeFilter !== 'all') {
      filtered = filtered.filter((wd: any) => wd.walletType === walletTypeFilter);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((wd: any) => new Date(wd.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((wd: any) => new Date(wd.createdAt) <= end);
    }
    
    return filtered;
  };

  const exportToCSV = () => {
    if (!report) return;

    const filtered = getFilteredWithdrawals();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Method', 'Status'];
    const rows = filtered.map((wd: any) => [
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
      wd.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!report) return;

    const filtered = getFilteredWithdrawals();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Method', 'Status'];
    const rows = filtered.map((wd: any) => [
      new Date(wd.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
      wd.userId,
      wd.userName,
      wd.userEmail,
      wd.withdrawalId || wd.id.substring(0, 8),
      wd.amount.toFixed(2),
      wd.charges.toFixed(2),
      wd.finalAmount.toFixed(2),
      wd.walletType,
      wd.method || 'crypto',
      wd.status,
    ]);

    const excelContent = [headers.join('\t'), ...rows.map((row: any[]) => row.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `withdrawals_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique wallet types for filter
  const getWalletTypes = (): string[] => {
    if (!report?.withdrawals) return [];
    const types = new Set(report.withdrawals.map((wd: any) => wd.walletType));
    return Array.from(types) as string[];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-black">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Withdrawals</h3>
              <p className="text-2xl font-bold text-black">{report.summary.totalWithdrawals}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${report.summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                ${report.summary.approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                ${report.summary.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Withdrawals Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-black">Withdrawals</h3>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <AdminUserSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  useCrownPrefix={searchUseCrownPrefix}
                  onUseCrownPrefixChange={setSearchUseCrownPrefix}
                  placeholderWithoutPrefix="Name, email, withdrawal ID..."
                />

                <div className="flex gap-4 flex-wrap items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={walletTypeFilter}
                    onChange={(e) => setWalletTypeFilter(e.target.value)}
                    className="px-4  text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Wallet Types</option>
                    {getWalletTypes().map((type: string) => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>

                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-black">Date Range:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-black">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                        }}
                        className="px-3 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">User ID</th>
                    <th className="text-left">User Name</th>
                    <th className="text-left">Withdrawal ID</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Charges</th>
                    <th className="text-left">Final Amount</th>
                    <th className="text-left">Wallet Type</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredWithdrawals().length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-black">
                        {searchTerm || statusFilter !== 'all' || walletTypeFilter !== 'all' || startDate || endDate
                          ? 'No withdrawals found matching your filters'
                          : 'No withdrawals found'}
                      </td>
                    </tr>
                  ) : (
                    getFilteredWithdrawals().map((wd: any) => (
                      <tr key={wd.id}>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">{new Date(wd.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-mono text-black truncate max-w-[130px]" title={wd.userId}>{wd.userId}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black truncate max-w-[120px]" title={wd.userName}>{wd.userName}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-mono text-black truncate max-w-[120px]" title={wd.withdrawalId || wd.id.substring(0, 8)}>{wd.withdrawalId || wd.id.substring(0, 8)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-black">${wd.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">${wd.charges.toFixed(2)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-green-600">${wd.finalAmount.toFixed(2)}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black capitalize">{wd.walletType}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                            wd.status === 'approved' || wd.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm' :
                            wd.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 font-bold shadow-sm' :
                            wd.status === 'rejected' || wd.status === 'failed' || wd.status === 'suspended' || wd.status === 'blocked' ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm' :
                            wd.status === 'inactive' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm' :
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
            
            {getFilteredWithdrawals().length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 text-sm text-black">
                Showing {getFilteredWithdrawals().length} of {report.withdrawals.length} withdrawals
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

