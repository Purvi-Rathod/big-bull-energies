'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return t.badgeActive;
      case 'blocked':
      case 'suspended':
        return t.badgeError;
      default:
        return t.badgeNeutral;
    }
  };

  if (loading) {
    return <BigBullLoader text="Loading referrals…" />;
  }

  return (
    <div className={t.page}>
      <div className={`${t.card} flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
        <div>
          <h1 className={t.title}>My Direct Referrals</h1>
          <p className={t.subtitle}>
            View and manage all users who registered using your referral link
          </p>
        </div>
        {pagination.total > 0 && (
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: t.muted }}>Total Referrals</p>
            <p className="text-3xl font-extrabold" style={{ color: t.primary }}>{pagination.total}</p>
          </div>
        )}
      </div>

      <div className={t.card}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className={t.label}>Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by User ID, Name, Email, or Phone..."
                className={`${t.input} flex-1`}
              />
              <button type="submit" className={t.btnPrimary}>Search</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className={t.label}>Status</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className={t.select}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label htmlFor="position" className={t.label}>Position</label>
              <select
                id="position"
                value={positionFilter}
                onChange={(e) => handlePositionFilter(e.target.value)}
                className={t.select}
              >
                <option value="">All Positions</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={clearFilters} className={`${t.btnSecondary} w-full`}>
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={t.tableWrap}>
        {error ? (
          <div className="p-12 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button type="button" onClick={fetchReferrals} className={`${t.btnPrimary} mt-4`}>
              Retry
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className={t.cardEmpty}>
            <h3 className="text-lg font-bold" style={{ color: t.ink }}>No referrals found</h3>
            <p className="mt-2 text-sm font-medium" style={{ color: t.muted }}>
              {searchTerm || statusFilter || positionFilter
                ? 'Try adjusting your filters'
                : "You don't have any direct referrals yet. Share your referral links to start building your team."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={t.table}>
                <thead className={t.tableHead}>
                  <tr>
                    <th className={t.tableHeadCell}>User ID</th>
                    <th className={t.tableHeadCell}>Name</th>
                    <th className={t.tableHeadCell}>Contact</th>
                    <th className={t.tableHeadCell}>Position</th>
                    <th className={t.tableHeadCell}>Country</th>
                    <th className={t.tableHeadCell}>Joined At</th>
                    <th className={t.tableHeadCell}>Status</th>
                  </tr>
                </thead>
                <tbody className={t.tableBody}>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className={t.tableRow}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold" style={{ color: t.primary }}>
                          {ref.userId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold" style={{ color: t.ink }}>
                          {ref.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm">
                          {ref.email && (
                            <div className="flex items-center gap-2">
                              <a href={`mailto:${ref.email}`} className="font-semibold hover:underline" style={{ color: t.primary }}>
                                {ref.email}
                              </a>
                            </div>
                          )}
                          {ref.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <a href={`tel:${ref.phone}`} className="font-semibold hover:underline" style={{ color: t.primary }}>
                                {ref.phone}
                              </a>
                            </div>
                          )}
                          {!ref.email && !ref.phone && <span style={{ color: t.muted }}>—</span>}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm capitalize font-semibold" style={{ color: t.ink }}>
                          {ref.position || '—'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: t.muted }}>
                          {ref.country || '—'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: t.muted }}>
                          {ref.joinedAt ? new Date(ref.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : '—'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-full ${getStatusBadge(ref.status)}`}>
                          {ref.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-4 md:px-6 py-4 border-t border-[#d8e6ec] bg-[#F7FBFC]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm font-semibold" style={{ color: t.muted }}>
                    Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
                    {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                    <span style={{ color: t.primary }}>{pagination.total}</span> referrals
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={t.btnSecondary}
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
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              currentPage === pageNum
                                ? t.btnPrimary
                                : t.btnSecondary
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={currentPage === pagination.pages}
                      className={t.btnSecondary}
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
  );
}
