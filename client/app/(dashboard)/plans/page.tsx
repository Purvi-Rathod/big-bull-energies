'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import CrownLoader from '@/components/CrownLoader';

interface Package {
  id: string;
  packageName: string;
  minAmount: number;
  maxAmount: number;
  duration: number;
  // New fields
  totalOutputPct?: number; // Total output percentage (e.g., 225%)
  renewablePrinciplePct?: number; // Renewable principle percentage (e.g., 50%)
  referralPct?: number; // Referral bonus percentage (e.g., 7%)
  binaryPct?: number; // Binary bonus percentage (e.g., 10%)
  powerCapacity?: number; // Power capacity / capping limit (e.g., 1000)
  status?: 'Active' | 'InActive';
  // Legacy fields (for backward compatibility)
  roi?: number; // Daily ROI percentage (deprecated, use totalOutputPct)
  binaryBonus?: number; // (deprecated, use binaryPct)
  cappingLimit?: number; // (deprecated, use powerCapacity)
  principleReturn?: number; // (deprecated, use renewablePrinciplePct)
  levelOneReferral?: number; // (deprecated, use referralPct)
}

export default function PlansPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [mainWalletBalance, setMainWalletBalance] = useState<number | null>(null);
  const [useMainWallet, setUseMainWallet] = useState(false);
  const processingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    fetchPackages();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.getUserPackages();
      if (response.data) {
        setPackages(response.data.packages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestNow = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setInvestAmount(pkg.minAmount.toString());
    setSelectedVoucherId(null);
    setUseMainWallet(false);
    setShowInvestModal(true);
    setError('');

    // Fetch available vouchers and main wallet balance
    await Promise.all([
      fetchAvailableVouchers(),
      fetchMainWalletBalance(),
    ]);
  };

  const fetchMainWalletBalance = async () => {
    try {
      const response = await api.getUserWallets();
      if (response.data?.wallets) {
        const mainWallet = response.data.wallets.find((w: any) => w.type === 'main');
        setMainWalletBalance(mainWallet ? mainWallet.balance : 0);
      }
    } catch (err) {
      console.error('Failed to fetch main wallet balance:', err);
      setMainWalletBalance(0);
    }
  };

  const fetchAvailableVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await api.getUserVouchers({ status: 'active' });
      console.log('Vouchers response:', response);

      if (response.data?.vouchers) {
        // Filter vouchers that are not expired
        const now = new Date();
        const validVouchers = response.data.vouchers.filter((v: any) => {
          if (v.status !== 'active') {
            console.log('Voucher filtered out - status:', v.status, v.voucherId);
            return false;
          }
          if (v.expiry) {
            const expiryDate = new Date(v.expiry);
            if (expiryDate <= now) {
              console.log('Voucher filtered out - expired:', v.voucherId, expiryDate);
              return false;
            }
          }
          return true;
        });
        console.log('Valid vouchers:', validVouchers);
        setAvailableVouchers(validVouchers);
      } else {
        console.log('No vouchers in response');
        setAvailableVouchers([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch vouchers:', err);
      // Don't show error, just continue without vouchers
      setAvailableVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleCreatePayment = async () => {
    // Prevent double-click/duplicate submission
    if (processingRef.current || creatingPayment) {
      return;
    }

    if (!selectedPackage || !investAmount) {
      setError('Please enter an investment amount');
      return;
    }

    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount < selectedPackage.minAmount || amount > selectedPackage.maxAmount) {
      setError(`Amount must be between $${selectedPackage.minAmount.toLocaleString()} and $${selectedPackage.maxAmount.toLocaleString()}`);
      return;
    }

    if (selectedPackage.status !== 'Active') {
      setError('This package is not active');
      return;
    }

    // Validate voucher usage: Investment cannot exceed 2x the voucher's purchase amount (voucher investment value)
    if (selectedVoucherId) {
      const selectedVoucher = availableVouchers.find((v: any) => v.voucherId === selectedVoucherId);
      if (selectedVoucher) {
        const voucherInvestmentValue = selectedVoucher.investmentValue || selectedVoucher.amount * 2;
        // Investment amount cannot be more than 2x the voucher purchase amount (voucher investment value)
        if (amount > voucherInvestmentValue) {
          setError(`Investment amount ($${amount.toLocaleString()}) cannot exceed the voucher's investment value ($${voucherInvestmentValue.toLocaleString()}). Maximum investment with this voucher is $${voucherInvestmentValue.toLocaleString()}.`);
          return;
        }
      }
    }

    try {
      processingRef.current = true;
      setCreatingPayment(true);
      setError('');

      const response = await api.createPayment({
        packageId: selectedPackage.id,
        amount,
        currency: 'USD',
        voucherId: selectedVoucherId || undefined,
        useMainWallet: useMainWallet,
      });

      // Check if investment was created directly (payment gateway disabled)
      if (response.data?.investment) {
        // Investment created directly without payment
        setError('');
        setShowInvestModal(false);
        setSelectedPackage(null);
        setInvestAmount('');
        setSelectedVoucherId(null);
        processingRef.current = false;
        // Show success message or redirect
        alert('Investment created successfully!');
        // Optionally reload the page or redirect to investments page
        window.location.href = '/investments';
        return;
      }

      if (response.data?.payment?.paymentUrl) {
        // If payment status is "completed" (free payment when NOWPayments is disabled), redirect to success page
        if (response.data?.payment?.status === 'completed') {
          console.log('Free payment created, redirecting to success page:', response.data.payment.paymentUrl);
          processingRef.current = false;
          window.location.href = response.data.payment.paymentUrl;
        } else {
          // Redirect to NOWPayments payment page
          console.log('Redirecting to NOWPayments:', response.data.payment.paymentUrl);
          processingRef.current = false;
          window.location.href = response.data.payment.paymentUrl;
        }
      } else {
        // Check if we can construct payment URL from payment ID
        if (response.data?.payment?.paymentId) {
          const constructedUrl = `https://nowpayments.io/payment/?iid=${response.data.payment.paymentId}`;
          console.log('Redirecting to NOWPayments (constructed URL):', constructedUrl);
          window.location.href = constructedUrl;
        } else if (response.data?.payment?.payAddress) {
          setError('Payment address received but payment URL is not available. Please contact support with payment address: ' + response.data.payment.payAddress);
        } else {
          console.error('Payment response:', response);
          setError('Failed to get payment URL. Please check the console for details or contact support.');
        }
      }
    } catch (err: any) {
      console.error('Payment creation error:', err);
      setError(err.message || 'Failed to create payment. Please ensure NOWPayments is configured.');
      setCreatingPayment(false);
      processingRef.current = false;
    }
  };


  if (loading) {
    return <CrownLoader fullScreen />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        {packages.length === 0 && !loading && (
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-12 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30">
              <p className="text-gray-400 text-lg">No active packages available at the moment.</p>
            </div>
          </div>
        )}

        {packages.length > 0 && (
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Investment Packages</span>
              </h1>
              <p className="text-gray-400 text-sm">
                Showing {packages.length} active package{packages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                // Use roi field directly if available (it's already a percentage), otherwise calculate from totalOutputPct
                const totalOutputPct = pkg.totalOutputPct || (pkg.roi ? pkg.roi * pkg.duration : 225);
                // roi field is the daily ROI percentage (e.g., 1.5 means 1.5% per day)
                // If roi exists, use it directly; otherwise calculate from totalOutputPct
                const dailyRoiRate = pkg.roi ? pkg.roi / 100 : (totalOutputPct / 100) / pkg.duration;
                // Solar Starter: 60% renewable principal per DB; others use package value
                const renewablePrinciplePct = pkg.packageName === 'Solar Starter' ? 60 : (pkg.renewablePrinciplePct ?? pkg.principleReturn ?? 60);
                // Round referral % for display so e.g. 10.05% from DB shows as 10%
                const referralPct = Math.round(pkg.referralPct ?? pkg.levelOneReferral ?? 7);
                const binaryPct = pkg.binaryPct || pkg.binaryBonus || 10;
                const powerCapacity = pkg.powerCapacity || pkg.cappingLimit || 1000;
                const status = pkg.status || 'Active';

                return (
                  <div key={pkg.id} className="group relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition-all duration-300 overflow-hidden p-6">
                    {/* Animated gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:via-yellow-500/10 group-hover:to-yellow-500/5 transition-all duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">{pkg.packageName}</h3>
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg ${status === 'Active'
                          ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                          : 'bg-red-900/40 text-red-400 border border-red-500/40'
                          }`}>
                          {status}
                        </span>
                      </div>

                      <div className="space-y-4 mb-6">
                        {/* Investment Amount Range */}
                        <div className="p-4 bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 rounded-xl border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10">
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Investment Range</p>
                          <p className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            ${pkg.minAmount.toLocaleString()} - ${pkg.maxAmount.toLocaleString()}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Duration:</span>
                          <span className="text-sm font-bold text-white">{pkg.duration} days</span>
                        </div>

                        {/* Total Output Percentage */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Total Output:</span>
                          <span className="text-lg font-extrabold text-yellow-400">
                            {/* {pkg.roi !== undefined && pkg.roi !== null
                              ? `${((pkg.duration * pkg.roi) + renewablePrinciplePct).toFixed(2)}%`
                              : `${totalOutputPct}%`} */}
                            {(pkg.packageName == "Solar Starter") ? "360%" : (pkg.packageName == "Elite Energy") ? "460%" : "412%"}
                          </span>
                        </div>

                        {/* Daily ROI Rate */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Daily ROI Rate:</span>
                          <span className="text-sm font-bold text-yellow-300">
                            {pkg.roi ? `${pkg.roi}%` : `${(dailyRoiRate * 100).toFixed(4)}%`}
                          </span>
                        </div>

                        {/* Renewable Principle: Solar Starter 60%, others from package */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Renewable Principle:</span>
                          <span className="text-sm font-bold text-yellow-400">{renewablePrinciplePct}%</span>
                        </div>

                        {/* Referral Bonus: rounded so 10.05% displays as 10% */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Referral Bonus:</span>
                          <span className="text-sm font-bold text-yellow-400">{referralPct}%</span>
                        </div>

                        {/* Binary Bonus */}
                        <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
                          <span className="text-sm font-semibold text-gray-300">Binary Bonus:</span>
                          <span className="text-sm font-bold text-yellow-400">{binaryPct}%</span>
                        </div>

                        {/* Power Capacity / Capping Limit */}
                        <div className="flex justify-between items-center py-3">
                          <span className="text-sm font-semibold text-gray-300">Power Capacity:</span>
                          <span className="text-sm font-bold text-white">${powerCapacity.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInvestNow(pkg)}
                        disabled={status !== 'Active'}
                        className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold text-lg transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                      >
                        {status === 'Active' ? 'Invest Now' : 'Package Inactive'}
                      </button>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Investment Modal */}
        {showInvestModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border border-yellow-500/30 w-full max-w-md shadow-2xl rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm">
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Make Investment</span>
                </h3>

                <div className="mb-6 p-5 bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 rounded-xl border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10">
                  <h4 className="font-extrabold text-white mb-3 text-lg">{selectedPackage.packageName}</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Amount Range:</span>
                      <span className="font-bold text-yellow-400">${selectedPackage.minAmount.toLocaleString()} - ${selectedPackage.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Duration:</span>
                      <span className="font-bold text-white">{selectedPackage.duration} days</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-300 font-semibold mt-1">Total Output:</span>
                      <div className="text-right">
                        <span className="font-bold text-yellow-400 block">
                          {(() => {
                            const renewablePct = selectedPackage.packageName === 'Solar Starter' ? 60 : (selectedPackage.renewablePrinciplePct ?? selectedPackage.principleReturn ?? 60);
                            return selectedPackage.roi !== undefined && selectedPackage.roi !== null
                              ? ((selectedPackage.duration * selectedPackage.roi) + renewablePct).toFixed(2)
                              : (selectedPackage.totalOutputPct || 225);
                          })()}%
                        </span>
                        {selectedPackage.roi !== undefined && selectedPackage.roi !== null && (
                          <span className="text-xs text-gray-400 block mt-0.5">
                            ({selectedPackage.roi}% × {selectedPackage.duration} days + {(selectedPackage.packageName === 'Solar Starter' ? 60 : (selectedPackage.renewablePrinciplePct ?? selectedPackage.principleReturn ?? 60))}% Capital Back)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voucher Selection */}
                {loadingVouchers ? (
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400">Loading vouchers...</p>
                  </div>
                ) : availableVouchers.length > 0 ? (
                  <div className="mb-6 p-5 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl border border-yellow-500/30">
                    <label className="block text-sm font-bold text-yellow-400 mb-3">
                      Use Voucher (Optional)
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      💡 Tip: To use a voucher, you must invest at least 2x the voucher purchase amount. A $100 voucher requires a minimum investment of $200.
                    </p>
                    <select
                      value={selectedVoucherId || ''}
                      onChange={(e) => setSelectedVoucherId(e.target.value || null)}
                      className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 mb-3 font-semibold"
                    >
                      <option value="">No voucher</option>
                      {availableVouchers.map((voucher: any) => {
                        const voucherInvestmentValue = voucher.investmentValue || voucher.amount * 2;
                        return (
                          <option key={voucher.voucherId} value={voucher.voucherId}>
                            ${voucher.amount.toLocaleString()} voucher (Covers up to $${voucherInvestmentValue.toLocaleString()})
                            {voucher.expiry && ` - Expires: ${new Date(voucher.expiry).toLocaleDateString()}`}
                          </option>
                        );
                      })}
                    </select>
                    {selectedVoucherId && (() => {
                      const selectedVoucher = availableVouchers.find((v: any) => v.voucherId === selectedVoucherId);
                      if (selectedVoucher) {
                        const voucherPurchaseAmount = selectedVoucher.amount; // Purchase amount (e.g., $100)
                        const voucherInvestmentValue = selectedVoucher.investmentValue || selectedVoucher.amount * 2; // Investment value (e.g., $200)
                        const investmentAmount = parseFloat(investAmount) || 0;
                        const minimumInvestmentRequired = voucherPurchaseAmount * 2; // Must invest at least 2x purchase amount
                        const meetsMinimumRequirement = investmentAmount >= minimumInvestmentRequired;
                        const remainingAmount = Math.max(0, investmentAmount - voucherInvestmentValue);

                        return (
                          <div className="text-sm space-y-3">
                            <div className="flex justify-between p-2 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-300 font-semibold">Voucher Purchase Amount:</span>
                              <span className="font-bold text-white">${voucherPurchaseAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-300 font-semibold">Voucher Investment Value:</span>
                              <span className="font-bold text-yellow-400">${voucherInvestmentValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-800/50 rounded-lg">
                              <span className="text-gray-300 font-semibold">Your Investment Amount:</span>
                              <span className="font-bold text-white">${investmentAmount.toLocaleString()}</span>
                            </div>
                            {!meetsMinimumRequirement && investmentAmount > 0 ? (
                              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
                                <div className="text-red-400 font-bold flex items-center mb-2">
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  ⚠️ Minimum Investment Required
                                </div>
                                <div className="text-xs text-red-300">
                                  To use this voucher, you must invest at least <strong className="text-red-400">${minimumInvestmentRequired.toLocaleString()}</strong> (2x the voucher purchase amount of ${voucherPurchaseAmount.toLocaleString()}).
                                </div>
                              </div>
                            ) : meetsMinimumRequirement && investmentAmount > 0 && voucherInvestmentValue >= investmentAmount ? (
                              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/15 border border-yellow-500/40 rounded-xl">
                                <div className="text-yellow-400 font-bold flex items-center mb-2">
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  ✓ Voucher covers your investment!
                                </div>
                                <div className="text-xs text-yellow-300">
                                  Your ${investmentAmount.toLocaleString()} investment is fully covered. No additional payment required.
                                </div>
                              </div>
                            ) : meetsMinimumRequirement && investmentAmount > voucherInvestmentValue ? (
                              <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex justify-between">
                                  <span className="text-gray-300 font-semibold">After Voucher:</span>
                                  <span className="font-bold text-white">${remainingAmount.toLocaleString()}</span>
                                </div>
                                {useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0 && (() => {
                                  const mainWalletToUse = Math.min(mainWalletBalance, remainingAmount);
                                  const finalPayment = remainingAmount - mainWalletToUse;
                                  return (
                                    <>
                                      <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                                        <span className="text-gray-300 font-semibold">Main Wallet:</span>
                                        <span className="font-bold text-blue-400">-${mainWalletToUse.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between border-t-2 border-yellow-500/50 pt-2 mt-2">
                                        <span className="text-yellow-400 font-bold">Amount to Pay:</span>
                                        <span className="font-bold text-yellow-400 text-lg">${finalPayment.toLocaleString()}</span>
                                      </div>
                                    </>
                                  );
                                })()}
                                {(!useMainWallet || !mainWalletBalance || mainWalletBalance === 0) && (
                                  <div className="flex justify-between border-t-2 border-yellow-500/50 pt-2 mt-2">
                                    <span className="text-yellow-400 font-bold">Amount to Pay:</span>
                                    <span className="font-bold text-yellow-400 text-lg">${remainingAmount.toLocaleString()}</span>
                                  </div>
                                )}
                                {!useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0 && (
                                  <div className="text-xs text-blue-300 mt-2">
                                    💡 You can use ${mainWalletBalance.toFixed(2)} from main wallet to reduce payment
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400">No active vouchers available. <a href="/vouchers" className="text-yellow-400 hover:text-yellow-300 hover:underline font-semibold">Create one?</a></p>
                  </div>
                )}

                {/* Main Wallet Option */}
                {mainWalletBalance !== null && mainWalletBalance > 0 && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/30">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMainWallet}
                        onChange={(e) => setUseMainWallet(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400 rounded mt-0.5"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-bold text-white">
                          Use Main Wallet Balance
                        </span>
                        <p className="text-xs text-gray-300 mt-1">
                          Available: <span className="font-semibold text-blue-400">${mainWalletBalance.toFixed(2)}</span> • This amount can only be used to activate investment packages
                        </p>
                        {useMainWallet && investAmount && !isNaN(parseFloat(investAmount)) && (() => {
                          const investmentAmount = parseFloat(investAmount);
                          const selectedVoucher = selectedVoucherId ? availableVouchers.find((v: any) => v.voucherId === selectedVoucherId) : null;
                          const voucherValue = selectedVoucher ? (selectedVoucher.investmentValue || selectedVoucher.amount * 2) : 0;
                          const amountAfterVoucher = Math.max(0, investmentAmount - voucherValue);
                          const mainWalletToUse = Math.min(mainWalletBalance, amountAfterVoucher);
                          
                          return (
                            <div className="mt-3 text-sm">
                              {voucherValue > 0 && (
                                <div className="mb-2 p-2 bg-gray-800/50 rounded-lg">
                                  <span className="text-gray-300">After voucher coverage:</span>
                                  <span className="font-semibold text-white ml-2">${amountAfterVoucher.toFixed(2)}</span>
                                </div>
                              )}
                              {amountAfterVoucher > 0 && (
                                <div className="p-2 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                                  <span className="text-blue-300 font-semibold">
                                    ✓ Will use ${mainWalletToUse.toFixed(2)} from main wallet
                                  </span>
                                </div>
                              )}
                              {amountAfterVoucher === 0 && (
                                <div className="p-2 bg-green-500/20 border border-green-500/40 rounded-lg">
                                  <span className="text-green-300 font-semibold">
                                    ✓ Investment fully covered by voucher
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </label>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-bold text-white mb-3">
                    Investment Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    min={selectedPackage.minAmount}
                    max={selectedPackage.maxAmount}
                    step="0.01"
                    className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                    placeholder={`Enter amount (${selectedPackage.minAmount} - ${selectedPackage.maxAmount})`}
                  />
                  {investAmount && !isNaN(parseFloat(investAmount)) && !selectedVoucherId && (() => {
                    const investmentAmount = parseFloat(investAmount);
                    const mainWalletToUse = useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0
                      ? Math.min(mainWalletBalance, investmentAmount)
                      : 0;
                    const finalPayment = investmentAmount - mainWalletToUse;
                    
                    return (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-semibold">Investment Amount:</span>
                            <span className="font-bold text-white">${investmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {useMainWallet && mainWalletToUse > 0 && (
                            <div className="flex justify-between border-t border-gray-700 pt-2">
                              <span className="text-gray-300 font-semibold">Main Wallet Applied:</span>
                              <span className="font-bold text-blue-400">-${mainWalletToUse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t-2 border-yellow-500/50 pt-2">
                            <span className="text-yellow-400 font-bold">Amount to Pay:</span>
                            <span className="font-bold text-yellow-400 text-lg">${finalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {error && (
                  <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Voucher validation warning */}
                {selectedVoucherId && (() => {
                  const selectedVoucher = availableVouchers.find((v: any) => v.voucherId === selectedVoucherId);
                  if (selectedVoucher) {
                    const voucherPurchaseAmount = selectedVoucher.amount;
                    const minimumInvestmentRequired = voucherPurchaseAmount * 2;
                    const investmentAmount = parseFloat(investAmount) || 0;
                    const meetsMinimumRequirement = investmentAmount >= minimumInvestmentRequired;

                    if (!meetsMinimumRequirement && investmentAmount > 0) {
                      return (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl">
                          <div className="text-yellow-400 text-sm font-bold flex items-center mb-2">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Warning: Minimum Investment Required
                          </div>
                          <div className="text-xs text-yellow-300 mt-1">
                            To use this ${voucherPurchaseAmount.toLocaleString()} voucher, you must invest at least <strong className="text-yellow-400">${minimumInvestmentRequired.toLocaleString()}</strong> (2x the voucher purchase amount).
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowInvestModal(false);
                      setSelectedPackage(null);
                      setInvestAmount('');
                      setSelectedVoucherId(null);
                      setUseMainWallet(false);
                      setError('');
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePayment}
                    disabled={(() => {
                      if (creatingPayment) return true;
                      if (selectedVoucherId) {
                        const selectedVoucher = availableVouchers.find((v: any) => v.voucherId === selectedVoucherId);
                        if (selectedVoucher) {
                          const voucherPurchaseAmount = selectedVoucher.amount;
                          const minimumInvestmentRequired = voucherPurchaseAmount * 2;
                          const investmentAmount = parseFloat(investAmount) || 0;
                          return investmentAmount < minimumInvestmentRequired;
                        }
                      }
                      return false;
                    })()}
                    className="px-6 py-3 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  >
                    {creatingPayment ? 'Creating Payment...' : 'Proceed to Payment'}
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

