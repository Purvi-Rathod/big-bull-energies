'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NOWPaymentsReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const response = await api.getNOWPaymentsReport();
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

    const headers = ['SL NO', 'User ID', 'User Name', 'User Email', 'Country', 'Payment ID', 'Package', 'USD Amount', 'Crypto Amount', 'Received', 'Status', 'Date'];
    const rows = report.payments.map((p: any, idx: number) => [
      idx + 1,
      p.userId,
      p.userName,
      p.userEmail,
      p.country || '—',
      p.paymentId,
      p.packageName,
      `${p.amount.toFixed(2)} ${p.currency?.toLowerCase() || 'usd'}`,
      p.cryptoAmount || '—',
      p.received || '—',
      p.status,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nowpayments_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <h3 className="text-sm font-medium text-black mb-2">Total Payments</h3>
              <p className="text-2xl font-bold text-black">{report.summary.totalPayments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-indigo-600">
                ${report.summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Completed</h3>
              <p className="text-2xl font-bold text-green-600">
                ${report.summary.completedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-black mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                ${report.summary.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Payments Table */}
          <div className="max-w-full bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">NOWPayments Transactions ({report.payments.length})</h3>
              {report.payments.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Export CSV
                </button>
              )}
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="text-left">SL NO</th>
                    <th className="text-left">User</th>
                    <th className="text-left">Country</th>
                    <th className="text-left">Payment ID</th>
                    <th className="text-left">Package</th>
                    <th className="text-left">USD</th>
                    <th className="text-left">Crypto</th>
                    <th className="text-left">Received</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.payments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 text-center text-black">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    report.payments.map((p: any, index: number) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-black">{index + 1}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-xs font-mono font-semibold text-black">{p.userId}</div>
                            <div className="text-xs text-black">{p.userName}</div>
                            <div className="text-xs text-gray-600 truncate max-w-[200px]" title={p.userEmail}>{p.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">{p.country || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-mono text-black" title={p.paymentId}>{p.paymentId}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-black">{p.packageName}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-medium text-black">{p.amount.toFixed(2)} usd</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-mono text-black">{p.cryptoAmount || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-mono text-black">{p.received || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            p.status === 'completed' || p.status === 'approved' || p.status === 'active' || p.status === 'paid'
                              ? 'bg-green-100 text-green-800 border border-green-300' :
                            p.status === 'pending' || p.status === 'processing' || p.status === 'sending'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                            p.status === 'rejected' || p.status === 'failed' || p.status === 'suspended' || p.status === 'blocked' || p.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-black">{new Date(p.createdAt).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

