'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const ALL_COUNTRIES = '';

export default function CountryBusinessReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_COUNTRIES);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getCountryBusinessReport();
      if (response.data) {
        setReport(response.data);
        if (!response.data.countries?.length) setSelectedCountry(ALL_COUNTRIES);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
      toast.error(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const countries = report?.countries ?? [];
  const selectedData = selectedCountry === ALL_COUNTRIES
    ? null
    : countries.find((c: any) => c.country === selectedCountry);

  const exportToCSV = () => {
    if (!report) return;
    const toExport = selectedCountry === ALL_COUNTRIES
      ? report.countries
      : selectedData ? [selectedData] : [];
    const headers = ['Country', 'Total Investment', 'Investment Count', 'User Count'];
    const rows = toExport.map((c: any) => [
      c.country,
      `$${c.totalInvestment.toFixed(2)}`,
      c.investmentCount,
      c.userCount,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = selectedCountry ? `country_business_${selectedCountry.replace(/\s+/g, '_')}.csv` : `country_business_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="mt-4 text-slate-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Country selector */}
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <label htmlFor="country-select" className="mb-1 text-black  block text-sm font-medium text-slate-700">
                Select country
              </label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full text-black  rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={ALL_COUNTRIES}>All countries</option>
                {countries
                  .slice()
                  .sort((a: any, b: any) => (a.country || '').localeCompare(b.country || ''))
                  .map((c: any) => (
                    <option key={c.country} value={c.country}>
                      {c.country} ({c.userCount} users, {formatCurrency(c.totalInvestment)})
                    </option>
                  ))}
              </select>
            </div>
            {(countries.length > 0 || selectedData) && (
              <button
                type="button"
                onClick={exportToCSV}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Export CSV
              </button>
            )}
          </div>

          {selectedCountry === ALL_COUNTRIES ? (
            <>
              {/* Summary cards - all countries */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Total countries</h3>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{report.summary.totalCountries}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Total users</h3>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{report.summary.totalUsers}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Total business</h3>
                  <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(report.summary.totalBusiness)}</p>
                </div>
              </div>

              {/* All countries table */}
              <div className="max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-lg font-semibold text-slate-900">Business by country ({countries.length})</h3>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Country</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Total investment</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Investment count</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">User count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {countries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No data found</td>
                        </tr>
                      ) : (
                        countries.map((c: any) => (
                          <tr key={c.country} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{c.country}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-indigo-600">{formatCurrency(c.totalInvestment)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700">{c.investmentCount}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700">{c.userCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : selectedData ? (
            <>
              {/* Summary for selected country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Country</h3>
                  <p className="mt-1 text-xl font-bold text-slate-900">{selectedData.country}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Total investment</h3>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{formatCurrency(selectedData.totalInvestment)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-600">Users / Investments</h3>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{selectedData.userCount} users · {selectedData.investmentCount} investments</p>
                </div>
              </div>

              {/* Users table for selected country */}
              <div className="max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedData.country} – {selectedData.userCount} {selectedData.userCount === 1 ? 'user' : 'users'}
                  </h3>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">User name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Total investment</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Investment count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedData.users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No users in this country</td>
                        </tr>
                      ) : (
                        selectedData.users.map((u: any) => (
                          <tr key={u.userId} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-sm text-slate-900">{u.userId}</td>
                            <td className="px-4 py-3 text-slate-900">{u.userName}</td>
                            <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]" title={u.userEmail}>{u.userEmail}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">{formatCurrency(u.totalInvestment)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700">{u.investmentCount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a country to view business.</p>
          )}
        </>
      )}
    </div>
  );
}
