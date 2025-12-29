'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import CneoLoader from '@/components/CneoLoader';

interface Referral {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  position: string | null;
  country: string | null;
  joinedAt: string;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getUserDirectReferrals({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        position: positionFilter || undefined,
      });
      
      if (response.data) {
        setReferrals(response.data.referrals || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load referrals');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [currentPage, statusFilter, positionFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchReferrals();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReferrals();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePositionFilter = (position: string) => {
    setPositionFilter(position);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPositionFilter('');
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20';
      case 'inactive':
        return 'bg-gray-700/50 text-gray-300 border border-gray-600';
      case 'suspended':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'blocked':
        return 'bg-red-900/40 text-red-400 border border-red-500/40';
      default:
        return 'bg-gray-700/50 text-gray-300 border border-gray-600';
    }
  };

  if (loading) {
    return <CneoLoader fullScreen />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Direct Referrals</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage all users who registered using your referral link
            </p>
          </div>
          {pagination.total > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-400 font-semibold">Total Referrals</p>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{pagination.total}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-6">
        <form onSubmit={handleSearch} className="space-y-5">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-bold text-yellow-400 mb-3">
              Search
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by User ID, Name, Email, or Phone..."
                className="flex-1 px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-bold text-yellow-400 mb-3">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Position Filter */}
            <div>
              <label htmlFor="position" className="block text-sm font-bold text-yellow-400 mb-3">
                Position
              </label>
              <select
                id="position"
                value={positionFilter}
                onChange={(e) => handlePositionFilter(e.target.value)}
                className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
              >
                <option value="">All Positions</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-6 py-3 border border-yellow-500/40 rounded-xl text-gray-300 hover:bg-yellow-500/10 hover:border-yellow-500/60 hover:text-white transition-all font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Referrals Table */}
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden">
        {error ? (
          <div className="p-12 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchReferrals}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-white">No referrals found</h3>
            <p className="mt-2 text-sm text-gray-400">
              {searchTerm || statusFilter || positionFilter
                ? 'Try adjusting your filters'
                : "You don't have any direct referrals yet. Share your referral links to start building your team."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-500/10">
                <thead className="bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Joined At</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/50 divide-y divide-yellow-500/10">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          {ref.userId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-white group-hover:text-yellow-100 transition-colors">
                          {ref.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          {ref.email && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${ref.email}`} className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
                                {ref.email}
                              </a>
                            </div>
                          )}
                          {ref.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${ref.phone}`} className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
                                {ref.phone}
                              </a>
                            </div>
                          )}
                          {!ref.email && !ref.phone && <span className="text-gray-500">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-gray-200 capitalize font-semibold">
                          {ref.position || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-gray-400">
                          {ref.country || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-gray-400">
                          {ref.joinedAt ? new Date(ref.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-lg ${
                            ref.status === 'active'
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : ref.status === 'blocked' || ref.status === 'suspended'
                              ? 'bg-red-900/40 text-red-400 border border-red-500/40'
                              : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                          }`}
                        >
                          {ref.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 px-6 py-5 border-t border-yellow-500/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-300 font-semibold">
                    Showing <span className="font-bold text-white">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-bold text-white">
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-bold text-yellow-400">{pagination.total}</span> referrals
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-yellow-500/40 rounded-xl text-sm font-bold text-gray-300 bg-gray-800 hover:bg-yellow-500/10 hover:border-yellow-500/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-yellow-500 shadow-lg shadow-yellow-500/30'
                                : 'border-yellow-500/40 text-gray-300 bg-gray-800 hover:bg-yellow-500/10 hover:border-yellow-500/60 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 border border-yellow-500/40 rounded-xl text-sm font-bold text-gray-300 bg-gray-800 hover:bg-yellow-500/10 hover:border-yellow-500/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
          </div>
        </div>
  );
}
