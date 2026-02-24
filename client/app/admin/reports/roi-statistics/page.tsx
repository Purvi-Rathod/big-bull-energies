'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminUserSearchInput, { getEffectiveUserSearch } from '@/components/AdminUserSearchInput';

export default function ROIStatisticsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUseCrownPrefix, setSearchUseCrownPrefix] = useState(true);
  const [sortBy, setSortBy] = useState<'totalROI' | 'roiCount'>('totalROI');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
      const response = await api.getROIReport();
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

  const exportToCSV = () => {
    if (!report) return;

    const filteredStats = getFilteredStats();
    const headers = ['User ID', 'User Name', 'User Email', 'Total ROI', 'ROI Count'];
    const rows = filteredStats.map((u: any) => [
      u.userId,
      u.userName,
      u.userEmail,
      `$${u.totalROI.toFixed(2)}`,
      u.roiCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `roi_user_statistics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!report) return;

    const filteredStats = getFilteredStats();
    const headers = ['User ID', 'User Name', 'User Email', 'Total ROI', 'ROI Count'];
    const rows = filteredStats.map((u: any) => [
      u.userId,
      u.userName,
      u.userEmail,
      u.totalROI.toFixed(2),
      u.roiCount,
    ]);

    // Create Excel-compatible CSV (tab-separated)
    const excelContent = [headers.join('\t'), ...rows.map((row: any[]) => row.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `roi_user_statistics_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredStats = () => {
    if (!report?.userStats) return [];
    
    let filtered = [...report.userStats];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const effectiveTerm = getEffectiveUserSearch(searchTerm, searchUseCrownPrefix).toLowerCase();
      filtered = filtered.filter((u: any) =>
        u.userId.toLowerCase().includes(effectiveTerm) ||
        u.userName.toLowerCase().includes(term) ||
        u.userEmail.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const handleSort = (field: 'totalROI' | 'roiCount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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

  const filteredStats = getFilteredStats();

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
              <h3 className="text-sm font-medium text-black mb-2">Total Users</h3>
              <p className="text-2xl font-bold text-black">{report.userStats.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total ROI Earned</h3>
              <p className="text-2xl font-bold text-purple-600">
                ${report.summary.totalROIEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Invested</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${report.summary.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">ROI Percentage</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {report.summary.roiPercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* User Stats Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-black">User ROI Statistics</h3>
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

            {/* Search and Filters */}
            <div className="mb-4 space-y-4">
              <div className="flex gap-4 items-center flex-wrap">
                <AdminUserSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  useCrownPrefix={searchUseCrownPrefix}
                  onUseCrownPrefixChange={setSearchUseCrownPrefix}
                  className="flex-1 min-w-[200px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort('totalROI')}
                    className={`px-4 py-2 rounded-md text-sm ${
                      sortBy === 'totalROI'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Sort by Total ROI {sortBy === 'totalROI' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('roiCount')}
                    className={`px-4 py-2 rounded-md text-sm ${
                      sortBy === 'roiCount'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Sort by Count {sortBy === 'roiCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalROI')}>
                      User ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase">User Email</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalROI')}>
                      Total ROI
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('roiCount')}>
                      ROI Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-black">
                        {searchTerm ? 'No users found matching your search' : 'No user statistics found'}
                      </td>
                    </tr>
                  ) : (
                    filteredStats.map((u: any) => (
                      <tr key={u.userId} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-xs font-mono text-black">
                          {u.userId}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {u.userName}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {u.userEmail}
                        </td>
                        <td className="px-3 py-3 text-xs font-medium text-purple-600">
                          ${u.totalROI.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-xs text-black">
                          {u.roiCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredStats.length > 0 && (
              <div className="mt-4 text-sm text-black">
                Showing {filteredStats.length} of {report.userStats.length} users
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
