'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

interface Investment {
  id: string;
  package: {
    id: string;
    name: string;
    roi: number;
    duration: number;
  } | null;
  investedAmount: number;
  depositAmount: number;
  type: string;
  isBinaryUpdated: boolean;
  createdAt: string;
  expiresOn?: string;
  voucherId?: string | null;
  voucher?: {
    voucherId: string;
    amount: number;
  } | null;
}

export default function InvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await api.getUserInvestments();
      if (response.data) {
        setInvestments(response.data.investments);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load investments';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (expiresOn?: string) => {
    if (!expiresOn) return null;
    const expiry = new Date(expiresOn);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleViewDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvestment(null);
  };

  const statusBadge = (active: boolean) =>
    active ? t.badgeActive : `${t.badgePending} bg-slate-100 text-slate-600 border-slate-200`;

  if (loading) {
    return <BigBullLoader text="Loading investments…" />;
  }

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>My Investments</h1>
        <p className={t.subtitle}>View and manage your investment portfolio</p>
      </div>

      {error && <div className={t.error}>{error}</div>}

      {investments.length === 0 ? (
        <div className={t.cardEmpty}>
          <p className="text-lg font-medium mb-4" style={{ color: t.muted }}>No investments yet</p>
          <button type="button" onClick={() => router.push('/plans')} className={t.btnPrimary}>
            Browse Plans
          </button>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {investments.map((inv) => {
              const daysRemaining = calculateDaysRemaining(inv.expiresOn);
              return (
                <div key={inv.id} className={t.card}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold" style={{ color: t.ink }}>
                        {inv.package?.name || 'Unknown Package'}
                      </h3>
                      <p className="text-xs capitalize font-medium" style={{ color: t.muted }}>{inv.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-extrabold rounded-full ${statusBadge(inv.isBinaryUpdated)}`}>
                      {inv.isBinaryUpdated ? 'Active' : 'Processing'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>Invested Amount</span>
                      <span className="font-extrabold" style={{ color: t.primary }}>{formatCurrency(inv.investedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>ROI</span>
                      <span className="font-semibold" style={{ color: t.ink }}>{inv.package?.roi || '-'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>Duration</span>
                      <span className="font-semibold" style={{ color: t.ink }}>{inv.package?.duration || '-'} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>Days Remaining</span>
                      <span className={`font-bold ${daysRemaining !== null && daysRemaining < 7 ? 'text-red-700' : ''}`} style={daysRemaining === null || daysRemaining >= 7 ? { color: t.primary } : undefined}>
                        {daysRemaining !== null ? `${daysRemaining} days` : 'Expired'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>Created</span>
                      <span className="text-xs" style={{ color: t.muted }}>{formatDate(inv.createdAt)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleViewDetails(inv)} className={`${t.btnSecondary} w-full text-sm`}>
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          <div className={`hidden md:block ${t.tableWrap}`}>
            <div className="overflow-x-auto">
              <table className={t.table}>
                <thead className={t.tableHead}>
                  <tr>
                    <th className={t.tableHeadCell}>Package</th>
                    <th className={t.tableHeadCell}>Invested Amount</th>
                    <th className={t.tableHeadCell}>ROI</th>
                    <th className={t.tableHeadCell}>Duration</th>
                    <th className={t.tableHeadCell}>Days Remaining</th>
                    <th className={t.tableHeadCell}>Status</th>
                    <th className={t.tableHeadCell}>Created Date</th>
                    <th className={t.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody className={t.tableBody}>
                  {investments.map((inv) => {
                    const daysRemaining = calculateDaysRemaining(inv.expiresOn);
                    return (
                      <tr key={inv.id} className={t.tableRow}>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold" style={{ color: t.ink }}>{inv.package?.name || 'Unknown Package'}</div>
                          <div className="text-xs capitalize mt-0.5" style={{ color: t.muted }}>{inv.type}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-extrabold" style={{ color: t.primary }}>{formatCurrency(inv.investedAmount)}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.ink }}>
                          {inv.package?.roi || '-'}%
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.ink }}>
                          {inv.package?.duration || '-'} days
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${daysRemaining !== null && daysRemaining < 7 ? 'text-red-700' : ''}`} style={daysRemaining === null || daysRemaining >= 7 ? { color: t.primary } : undefined}>
                            {daysRemaining !== null ? `${daysRemaining} days` : 'Expired'}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${statusBadge(inv.isBinaryUpdated)}`}>
                            {inv.isBinaryUpdated ? 'Active' : 'Processing'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm" style={{ color: t.muted }}>
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <button type="button" onClick={() => handleViewDetails(inv)} className="text-sm font-bold hover:underline" style={{ color: t.primary }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && selectedInvestment && (
        <div className={t.modalOverlay}>
          <div className={`${t.modalPanel} max-w-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold" style={{ color: t.ink }}>Investment Details</h3>
              <button type="button" onClick={handleCloseModal} className="text-[#5A6F78] hover:text-[#05627C]">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className={t.cardInner}>
                <h4 className="text-base font-extrabold mb-3" style={{ color: t.primary }}>Package Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold" style={{ color: t.muted }}>Package Name</p>
                    <p className="font-bold mt-0.5" style={{ color: t.ink }}>{selectedInvestment.package?.name || 'Unknown Package'}</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: t.muted }}>Investment Type</p>
                    <p className="font-bold capitalize mt-0.5" style={{ color: t.ink }}>{selectedInvestment.type}</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: t.muted }}>ROI Percentage</p>
                    <p className="font-bold mt-0.5" style={{ color: t.primary }}>{selectedInvestment.package?.roi || '-'}%</p>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: t.muted }}>Duration</p>
                    <p className="font-bold mt-0.5" style={{ color: t.ink }}>{selectedInvestment.package?.duration || '-'} days</p>
                  </div>
                </div>
              </div>

              <div className={t.cardHighlight}>
                <h4 className="text-base font-extrabold mb-3" style={{ color: t.ink }}>Financial Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.muted }}>Invested Amount</p>
                    <p className="text-xl font-extrabold mt-0.5" style={{ color: t.primary }}>{formatCurrency(selectedInvestment.investedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.muted }}>Deposit Amount</p>
                    <p className="text-xl font-extrabold mt-0.5" style={{ color: t.primary }}>{formatCurrency(selectedInvestment.depositAmount)}</p>
                  </div>
                </div>
                {selectedInvestment.voucher && (
                  <div className="mt-4 pt-4 border-t border-[rgba(245,207,11,0.35)]">
                    <p className="text-sm font-bold mb-2" style={{ color: t.primary }}>Activated Using Voucher</p>
                    <div className={t.cardInner}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: t.muted }}>Voucher ID</span>
                        <span className="font-mono font-bold" style={{ color: t.primary }}>{selectedInvestment.voucher.voucherId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: t.muted }}>Voucher Amount</span>
                        <span className="font-extrabold" style={{ color: t.primary }}>{formatCurrency(selectedInvestment.voucher.amount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={t.cardInner}>
                <h4 className="text-base font-extrabold mb-3" style={{ color: t.primary }}>Status & Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white">
                    <span className="font-semibold" style={{ color: t.muted }}>Status</span>
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${statusBadge(selectedInvestment.isBinaryUpdated)}`}>
                      {selectedInvestment.isBinaryUpdated ? 'Active' : 'Processing'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-white">
                    <span className="font-semibold" style={{ color: t.muted }}>Created Date</span>
                    <span className="font-bold" style={{ color: t.ink }}>{formatDate(selectedInvestment.createdAt)}</span>
                  </div>
                  {selectedInvestment.expiresOn && (
                    <>
                      <div className="flex justify-between p-2 rounded-lg bg-white">
                        <span className="font-semibold" style={{ color: t.muted }}>Expiry Date</span>
                        <span className="font-bold" style={{ color: t.ink }}>{formatDate(selectedInvestment.expiresOn)}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white">
                        <span className="font-semibold" style={{ color: t.muted }}>Days Remaining</span>
                        <span className="font-bold" style={{ color: t.primary }}>
                          {calculateDaysRemaining(selectedInvestment.expiresOn) !== null
                            ? `${calculateDaysRemaining(selectedInvestment.expiresOn)} days`
                            : 'Expired'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={t.cardInner}>
                <p className="text-sm font-semibold mb-1" style={{ color: t.muted }}>Investment ID</p>
                <p className="text-sm font-mono font-bold break-all" style={{ color: t.primary }}>{selectedInvestment.id}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={handleCloseModal} className={t.btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
