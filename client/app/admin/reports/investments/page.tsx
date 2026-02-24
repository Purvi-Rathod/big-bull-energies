'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminUserSearchInput, { getEffectiveUserSearch } from '@/components/AdminUserSearchInput';

export default function InvestmentsReportPage() {
  const searchParams = useSearchParams();
  const urlStart = searchParams.get('startDate') ?? '';
  const urlEnd = searchParams.get('endDate') ?? '';

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUseCrownPrefix, setSearchUseCrownPrefix] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'removed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
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
      const response = await api.getInvestmentsReport();
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

  const getFilteredInvestments = () => {
    if (!report?.investments) return [];
    
    let filtered = [...report.investments];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const effectiveTerm = getEffectiveUserSearch(searchTerm, searchUseCrownPrefix).toLowerCase();
      filtered = filtered.filter((inv: any) =>
        inv.userId.toLowerCase().includes(effectiveTerm) ||
        inv.userName.toLowerCase().includes(term) ||
        inv.userEmail.toLowerCase().includes(term) ||
        inv.packageName.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv: any) => {
        if (statusFilter === 'removed') return (inv.status === 'Removed by admin') || inv.removedByAdminAt;
        if (statusFilter === 'active') return inv.isActive && inv.status !== 'Removed by admin';
        if (statusFilter === 'inactive') return !inv.isActive && inv.status !== 'Removed by admin';
        return true;
      });
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter((inv: any) => inv.type === typeFilter);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((inv: any) => new Date(inv.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((inv: any) => new Date(inv.createdAt) <= end);
    }
    
    return filtered;
  };

  const exportToCSV = () => {
    if (!report) return;

    const filtered = getFilteredInvestments();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Package Name', 'Invested Amount', 'Type', 'Status', 'ROI Earned', 'Start Date', 'End Date'];
    const rows = filtered.map((inv: any) => [
      new Date(inv.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
      inv.userId,
      inv.userName,
      inv.userEmail,
      inv.packageName,
      `$${inv.investedAmount.toFixed(2)}`,
      inv.type,
      inv.status ?? (inv.isActive ? 'Active' : 'Inactive'),
      `$${inv.totalRoiEarned.toFixed(2)}`,
      new Date(inv.startDate).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
      new Date(inv.endDate).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!report) return;

    const filtered = getFilteredInvestments();
    const headers = ['Date', 'User ID', 'User Name', 'User Email', 'Package Name', 'Invested Amount', 'Type', 'Status', 'ROI Earned', 'Start Date', 'End Date'];
    const rows = filtered.map((inv: any) => [
      new Date(inv.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }),
      inv.userId,
      inv.userName,
      inv.userEmail,
      inv.packageName,
      inv.investedAmount.toFixed(2),
      inv.type,
      inv.status ?? (inv.isActive ? 'Active' : 'Inactive'),
      inv.totalRoiEarned.toFixed(2),
      new Date(inv.startDate).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
      new Date(inv.endDate).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }),
    ]);

    const excelContent = [headers.join('\t'), ...rows.map((row: any[]) => row.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investments_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique investment types for filter
  const getInvestmentTypes = (): string[] => {
    if (!report?.investments) return [];
    const types = new Set(report.investments.map((inv: any) => inv.type));
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
              <h3 className="text-sm font-medium text-black mb-2">Total Investments</h3>
              <p className="text-2xl font-bold text-black">{report.summary.totalInvestments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Active Investments</h3>
              <p className="text-2xl font-bold text-green-600">{report.summary.activeInvestments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${report.summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total ROI Earned</h3>
              <p className="text-2xl font-bold text-purple-600">
                ${report.summary.totalROIEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Package Stats */}
          {report.packageStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Package Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Package Name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Count</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.packageStats.map((pkg: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-3 text-xs font-medium text-black">
                          {pkg.packageName}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {pkg.count}
                        </td>
                        <td className="px-3 py-3 text-xs font-medium text-black">
                          ${pkg.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Investments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-black">All Investments</h3>
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
                  placeholderWithoutPrefix="Name, email, package..."
                />

                <div className="flex gap-4 flex-wrap items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="removed">Removed by admin</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 text-black  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    {getInvestmentTypes().map((type: string) => (
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
            <div className="max-w-full overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Package</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">ROI Earned</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredInvestments().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-black">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate
                          ? 'No investments found matching your filters'
                          : 'No investments found'}
                      </td>
                    </tr>
                  ) : (
                    getFilteredInvestments().map((inv: any) => (
                      <tr key={inv.id}>
                        <td className="px-3 py-3 text-xs text-black">
                          {new Date(inv.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false })}
                        </td>
                        <td className="px-3 py-3 text-xs font-mono text-black">
                          {inv.userId}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {inv.userName}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {inv.packageName}
                        </td>
                        <td className="px-3 py-3 text-xs font-medium text-black">
                          ${inv.investedAmount.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-xs text-black capitalize">
                          {inv.type}
                        </td>
                        <td className="px-3 py-3 text-xs font-medium text-purple-600">
                          ${inv.totalRoiEarned.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${
                            inv.status === 'Removed by admin'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : inv.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-black'
                          }`}>
                            {inv.status ?? (inv.isActive ? 'Active' : 'Inactive')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {getFilteredInvestments().length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 text-sm text-black">
                Showing {getFilteredInvestments().length} of {report.investments.length} investments
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

