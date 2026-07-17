'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';

interface Voucher {
  id: string;
  voucherId: string;
  amount: number;
  investmentValue?: number;
  multiplier?: number;
  originalAmount: number | null;
  fromWalletType: string | null;
  createdBy: { name: string; userId: string } | null;
  status: string;
  createdOn: string;
  usedAt: string | null;
  expiry: string | null;
  createdAt: string;
}

export default function VouchersPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAmount, setCreateAmount] = useState('');
  const [fromWalletType, setFromWalletType] = useState('');
  const [creating, setCreating] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [minVoucherAmount, setMinVoucherAmount] = useState<number>(12.5); // Default fallback
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchVouchers();
    fetchWallets();
    // Always fetch minimum voucher amount to get latest packages
    fetchMinimumVoucherAmount();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  // Also fetch minimum when modal opens to ensure latest value
  useEffect(() => {
    if (showCreateModal) {
      fetchMinimumVoucherAmount();
    }
  }, [showCreateModal]);

  const fetchMinimumVoucherAmount = async () => {
    try {
      const response = await api.getMinimumVoucherAmount();
      if (response.data?.minimumVoucherAmount) {
        setMinVoucherAmount(response.data.minimumVoucherAmount);
      }
    } catch (err: any) {
      console.error('Failed to load minimum voucher amount:', err);
      // Keep default fallback value (12.5)
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await api.getUserWallets();
      if (response.data) {
        setWallets(response.data.wallets || []);
      }
    } catch (err: any) {
      console.error('Failed to load wallets:', err);
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await api.getUserVouchers();
      if (response.data) {
        setVouchers(response.data.vouchers || []);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load vouchers';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async () => {
    if (!createAmount || parseFloat(createAmount) <= 0) {
      const errorMsg = 'Please enter a valid amount';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const requestedAmount = parseFloat(createAmount);
    if (requestedAmount < minVoucherAmount) {
      const errorMsg = `Minimum voucher amount is $${minVoucherAmount.toFixed(2)}. You cannot create a voucher below this amount.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!fromWalletType) {
      const errorMsg = 'Please select a wallet to create the voucher from';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check if selected wallet has sufficient balance
    const selectedWallet = wallets.find(w => w.type === fromWalletType);
    if (selectedWallet) {
      const availableBalance = parseFloat(selectedWallet.balance) - parseFloat(selectedWallet.reserved || '0');
      if (requestedAmount > availableBalance) {
        const errorMsg = `Insufficient balance. Available: $${availableBalance.toFixed(2)}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    try {
      setCreating(true);
      setError('');
      const response = await api.createVoucher({
        amount: parseFloat(createAmount),
        fromWalletType: fromWalletType,
      });

      if (response.data) {
        setShowCreateModal(false);
        setCreateAmount('');
        setFromWalletType('');
        setError('');
        await fetchVouchers();
        await fetchWallets();
        toast.success('Voucher created successfully!');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create voucher';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const getDaysRemaining = (expiry: string | null) => {
    if (!expiry) return null;
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysSinceCreation = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <BigBullLoader fullScreen />;
  }

  return (
    <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold mb-2 text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Vouchers</span>
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
        >
          + Create Voucher
        </button>
      </div>
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

      <div>
            {vouchers.length === 0 ? (
              <div className="bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/30 p-12 text-center">
                <p className="text-gray-400 text-lg mb-6">No vouchers found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                >
                  Create Your First Voucher
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => {
                  const expired = isExpired(voucher.expiry);
                  const daysRemaining = getDaysRemaining(voucher.expiry);
                  const daysSinceCreation = getDaysSinceCreation(voucher.createdAt);
                  const investmentValue = voucher.investmentValue || voucher.amount * (voucher.multiplier || 2);
                  
                  return (
                    <div key={voucher.id} className="group bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-400/30 p-6 hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-extrabold text-yellow-400 font-mono text-sm mb-1">{voucher.voucherId}</h3>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(voucher.createdOn || voucher.createdAt).toLocaleString()}
                          </p>
                          {daysSinceCreation !== null && (
                            <p className="text-xs text-gray-500">
                              {daysSinceCreation} day{daysSinceCreation !== 1 ? 's' : ''} ago
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg whitespace-nowrap ${
                            voucher.status === 'active' && !expired
                              ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                              : voucher.status === 'used'
                              ? 'bg-gray-700/50 text-gray-300 border border-gray-600'
                              : expired
                              ? 'bg-red-900/40 text-red-400 border border-red-500/40'
                              : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                          }`}
                        >
                          {expired ? 'Expired' : voucher.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="p-4 bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 rounded-xl border-2 border-yellow-400/40 shadow-lg shadow-yellow-500/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-200">Purchase Amount:</span>
                            <span className="text-xl font-extrabold text-yellow-400">
                              ${voucher.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300 font-semibold">Investment Value:</span>
                            <span className="text-lg font-extrabold text-yellow-400">
                              ${investmentValue.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-2 font-semibold">
                            Multiplier: {voucher.multiplier || 2}x
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-[#08152F]/80 rounded-xl border border-yellow-400/50">
                            <div className="text-gray-400 text-xs mb-1 font-semibold">Created At</div>
                            <div className="font-bold text-white">
                              {new Date(voucher.createdOn || voucher.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(voucher.createdOn || voucher.createdAt).toLocaleTimeString()}
                            </div>
                          </div>

                          {voucher.expiry && (
                            <div className={`p-3 rounded-xl border ${expired ? 'bg-red-900/30 border-red-500/40' : 'bg-gray-800/80 border-gray-700/50'}`}>
                              <div className="text-gray-400 text-xs mb-1 font-semibold">Expiry Date</div>
                              <div className={`font-bold ${expired ? 'text-red-400' : 'text-white'}`}>
                                {new Date(voucher.expiry).toLocaleDateString()}
                              </div>
                              <div className={`text-xs ${expired ? 'text-red-500' : 'text-gray-500'}`}>
                                {new Date(voucher.expiry).toLocaleTimeString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {voucher.expiry && daysRemaining !== null && (
                          <div className={`p-4 rounded-xl border-2 ${expired ? 'bg-red-900/30 border-red-500/50' : daysRemaining <= 7 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-gray-800/80 border-yellow-500/30'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-bold ${expired ? 'text-red-400' : daysRemaining <= 7 ? 'text-yellow-300' : 'text-gray-200'}`}>
                                Days Remaining:
                              </span>
                              <span className={`text-lg font-extrabold ${expired ? 'text-red-400' : daysRemaining <= 7 ? 'text-yellow-400' : 'text-yellow-400'}`}>
                                {expired ? 'Expired' : daysRemaining <= 0 ? '0' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                              </span>
                            </div>
                            {!expired && daysRemaining > 0 && (
                              <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${daysRemaining <= 7 ? 'bg-yellow-500' : 'bg-yellow-400'}`}
                                  style={{ width: `${Math.min(100, (daysRemaining / 120) * 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        )}

                        {voucher.usedAt && (
                          <div className="p-3 bg-gray-800/80 rounded-xl border border-yellow-500/30">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Used On:</span>
                              <span className="font-bold text-yellow-400">
                                {new Date(voucher.usedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {voucher.fromWalletType && (
                          <div className="flex justify-between items-center text-sm p-3 bg-gray-800/80 rounded-xl border border-gray-700/50">
                            <span className="text-gray-400">Created From:</span>
                            <span className="font-bold text-white">{voucher.fromWalletType} Wallet</span>
                          </div>
                        )}

                        {voucher.createdBy && (
                          <div className="flex justify-between items-center text-xs p-3 bg-gray-800/80 rounded-xl border border-gray-700/50">
                            <span className="text-gray-500">Created By:</span>
                            <span className="text-gray-300">{voucher.createdBy.name} ({voucher.createdBy.userId})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Create Voucher Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#08152F]/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border border-yellow-500/30 w-96 shadow-2xl rounded-2xl bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl">
              <div className="mt-3">
                <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Create Voucher</span>
                </h3>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-yellow-400 mb-3">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    min={minVoucherAmount}
                    step="0.01"
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                    placeholder={`Enter amount (minimum $${minVoucherAmount.toFixed(2)})`}
                  />
                  <p className="mt-2 text-xs text-gray-400 font-semibold">
                    Minimum voucher amount: <span className="text-yellow-400">${minVoucherAmount.toFixed(2)}</span>
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-yellow-400 mb-3">
                    From Wallet (Required)
                  </label>
                  <select
                    value={fromWalletType}
                    onChange={(e) => setFromWalletType(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                  >
                    <option value="">Select a wallet</option>
                    {wallets
                      .filter((wallet) => {
                        const allowedTypes = ['roi', 'interest', 'referral', 'binary', 'career_level'];
                        return allowedTypes.includes(wallet.type);
                      })
                      .map((wallet) => {
                        const walletNames: { [key: string]: string } = {
                          roi: 'ROI Wallet',
                          interest: 'Interest Wallet',
                          referral: 'Referral Wallet',
                          binary: 'Binary Wallet',
                          career_level: 'Career Level Wallet',
                        };
                        return (
                          <option key={wallet.type} value={wallet.type}>
                            {walletNames[wallet.type] || wallet.type} - ${parseFloat(wallet.balance).toFixed(2)}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateAmount('');
                      setFromWalletType('');
                      setError('');
                    }}
                    className="px-6 py-2.5 text-sm font-bold text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateVoucher}
                    disabled={creating}
                    className="px-6 py-2.5 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                  >
                    {creating ? 'Creating...' : 'Create Voucher'}
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
