'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminUserSearchInput, { getEffectiveUserSearch } from '@/components/AdminUserSearchInput';

export default function BinaryReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUseCrownPrefix, setSearchUseCrownPrefix] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const hasFetchedRef = useRef(false);

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
      const response = await api.getBinaryReport();
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

  const getFilteredTransactions = () => {
    if (!report?.transactions) return [];
    
    let filtered = [...report.transactions];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const effectiveTerm = getEffectiveUserSearch(searchTerm, searchUseCrownPrefix).toLowerCase();
      filtered = filtered.filter((tx: any) =>
        tx.userId.toLowerCase().includes(effectiveTerm) ||
        tx.userName.toLowerCase().includes(term) ||
        tx.userEmail.toLowerCase().includes(term)
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter((tx: any) => tx.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx: any) => tx.status === statusFilter);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((tx: any) => new Date(tx.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx: any) => new Date(tx.createdAt) <= end);
    }
    
    return filtered;
  };

  const exportToCSV = () => {
    if (!report) return;

    const filtered = getFilteredTransactions();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Status'];
    const rows = filtered.map((tx: any) => [
      new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
      tx.userId,
      tx.userName,
      tx.userEmail,
      tx.type.toUpperCase(),
      `$${tx.amount.toFixed(2)}`,
      `$${tx.balanceBefore.toFixed(2)}`,
      `$${tx.balanceAfter.toFixed(2)}`,
      tx.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `binary_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!report) return;

    const filtered = getFilteredTransactions();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Status'];
    const rows = filtered.map((tx: any) => [
      new Date(tx.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
      tx.userId,
      tx.userName,
      tx.userEmail,
      tx.type.toUpperCase(),
      tx.amount.toFixed(2),
      tx.balanceBefore.toFixed(2),
      tx.balanceAfter.toFixed(2),
      tx.status,
    ]);

    const excelContent = [headers.join('\t'), ...rows.map((row: any[]) => row.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `binary_transactions_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Transactions</h3>
              <p className="text-2xl font-bold text-black">{report.summary.totalTransactions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Credits</h3>
              <p className="text-2xl font-bold text-green-600">
                ${report.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Business</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${report.summary.totalBusiness.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Left Business</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${report.summary.totalLeftBusiness.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Right Business</h3>
              <p className="text-2xl font-bold text-purple-600">
                ${report.summary.totalRightBusiness.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-black">Binary Transactions</h3>
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
                />

                <div className="flex gap-4 flex-wrap items-center">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-4 py-2 text-black  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 text-black  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-black">Date Range:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 text-black  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-black">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 text-black  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Balance Before</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Balance After</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredTransactions().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-black">
                        {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate
                          ? 'No transactions found matching your filters'
                          : 'No transactions found'}
                      </td>
                    </tr>
                  ) : (
                    getFilteredTransactions().map((tx: any) => (
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
            
            {getFilteredTransactions().length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 text-sm text-black">
                Showing {getFilteredTransactions().length} of {report.transactions.length} transactions
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

