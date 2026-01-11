'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CrownLoader from '@/components/CrownLoader';

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
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchInvestments();

    // No cleanup - we want to prevent duplicate calls even on remount
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

  if (loading) {
    return <CrownLoader fullScreen />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Investments</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">View and manage your investment portfolio</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

            {investments.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-12 text-center">
                <p className="text-gray-400 text-lg mb-6">No investments yet</p>
                <button
                  onClick={() => router.push('/plans')}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                >
                  Browse Plans
                </button>
              </div>
            ) : (
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellow-500/10">
              <thead className="bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Invested Amount</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">ROI</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Days Remaining</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/50 divide-y divide-yellow-500/10">
                {investments.map((inv) => {
                  const daysRemaining = calculateDaysRemaining(inv.expiresOn);
                  return (
                    <tr key={inv.id} className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-white group-hover:text-yellow-100 transition-colors">
                            {inv.package?.name || 'Unknown Package'}
                        </div>
                        <div className="text-xs text-gray-400 capitalize mt-1">{inv.type}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                          {formatCurrency(inv.investedAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">
                          {inv.package?.roi || '-'}%
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">
                          {inv.package?.duration || '-'} days
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          daysRemaining !== null && daysRemaining < 7 
                            ? 'text-red-400' 
                            : daysRemaining !== null 
                            ? 'text-yellow-400' 
                            : 'text-gray-500'
                        }`}>
                          {daysRemaining !== null ? `${daysRemaining} days` : 'Expired'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-lg ${
                            inv.isBinaryUpdated
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                          }`}
                        >
                          {inv.isBinaryUpdated ? 'Active' : 'Processing'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {formatDate(inv.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold">
                        <button
                          onClick={() => handleViewDetails(inv)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors font-bold"
                        >
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
      )}

      {/* Investment Details Modal */}
      {showModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border border-yellow-500/30 w-full max-w-2xl shadow-2xl rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Investment Details</span>
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Package Information */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl p-5 border border-yellow-500/20">
                  <h4 className="text-lg font-extrabold text-yellow-400 mb-4">Package Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Package Name</p>
                      <p className="text-base font-bold text-white mt-1">
                        {selectedInvestment.package?.name || 'Unknown Package'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Investment Type</p>
                      <p className="text-base font-bold text-white capitalize mt-1">
                        {selectedInvestment.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">ROI Percentage</p>
                      <p className="text-base font-bold text-yellow-400 mt-1">
                        {selectedInvestment.package?.roi || '-'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Duration</p>
                      <p className="text-base font-bold text-white mt-1">
                        {selectedInvestment.package?.duration || '-'} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 rounded-xl p-5 border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10">
                  <h4 className="text-lg font-extrabold text-white mb-4">Financial Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-300 font-semibold">Invested Amount</p>
                      <p className="text-2xl font-extrabold text-yellow-400 mt-1">
                        {formatCurrency(selectedInvestment.investedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 font-semibold">Deposit Amount</p>
                      <p className="text-2xl font-extrabold text-yellow-400 mt-1">
                        {formatCurrency(selectedInvestment.depositAmount)}
                      </p>
                    </div>
                  </div>
                  {/* Voucher Information */}
                  {selectedInvestment.voucher && (
                    <div className="mt-5 pt-5 border-t border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-bold text-yellow-300">Activated Using Voucher</p>
                      </div>
                      <div className="bg-gray-800/80 rounded-xl p-4 border border-yellow-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400 font-semibold">Voucher ID:</span>
                          <span className="text-sm font-mono font-bold text-yellow-400">
                            {selectedInvestment.voucher.voucherId}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400 font-semibold">Voucher Amount:</span>
                          <span className="text-lg font-extrabold text-yellow-400">
                            {formatCurrency(selectedInvestment.voucher.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Timeline */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl p-5 border border-yellow-500/20">
                  <h4 className="text-lg font-extrabold text-yellow-400 mb-4">Status & Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-sm text-gray-300 font-semibold">Status</span>
                      <span
                        className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                          selectedInvestment.isBinaryUpdated
                            ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                            : 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                        }`}
                      >
                        {selectedInvestment.isBinaryUpdated ? 'Active' : 'Processing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                      <span className="text-sm text-gray-300 font-semibold">Created Date</span>
                      <span className="text-sm font-bold text-white">
                        {formatDate(selectedInvestment.createdAt)}
                      </span>
                    </div>
                    {selectedInvestment.expiresOn && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                          <span className="text-sm text-gray-300 font-semibold">Expiry Date</span>
                          <span className="text-sm font-bold text-white">
                            {formatDate(selectedInvestment.expiresOn)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                          <span className="text-sm text-gray-300 font-semibold">Days Remaining</span>
                          <span className={`text-sm font-bold ${
                            calculateDaysRemaining(selectedInvestment.expiresOn) !== null && 
                            calculateDaysRemaining(selectedInvestment.expiresOn)! < 7 
                              ? 'text-red-400' 
                              : 'text-yellow-400'
                          }`}>
                            {calculateDaysRemaining(selectedInvestment.expiresOn) !== null 
                              ? `${calculateDaysRemaining(selectedInvestment.expiresOn)} days` 
                              : 'Expired'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Investment ID */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl p-5 border border-yellow-500/20">
                  <p className="text-sm text-gray-400 font-semibold mb-2">Investment ID</p>
                  <p className="text-sm font-mono text-yellow-400 break-all font-bold">
                    {selectedInvestment.id}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
  );
}

