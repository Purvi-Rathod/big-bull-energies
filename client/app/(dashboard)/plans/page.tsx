'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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
    return <BigBullLoader text="Loading packages…" />;
  }

  return (
    <div className={t.page}>
        {error && <div className={t.error}>{error}</div>}

        {packages.length === 0 && !loading && (
          <div className={t.cardEmpty}>
            <p className="text-lg font-medium" style={{ color: t.muted }}>No active packages available at the moment.</p>
          </div>
        )}

        {packages.length > 0 && (
          <>
            <div>
              <h1 className={t.title}>Investment Packages</h1>
              <p className={t.subtitle}>
                Showing {packages.length} active package{packages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {packages.map((pkg) => {
                // Use roi field directly if available (it's already a percentage), otherwise calculate from totalOutputPct
                const totalOutputPct = pkg.totalOutputPct || (pkg.roi ? pkg.roi * pkg.duration : 225);
                // roi field is the daily ROI percentage (e.g., 1.5 means 1.5% per day)
                // If roi exists, use it directly; otherwise calculate from totalOutputPct
                const dailyRoiRate = pkg.roi ? pkg.roi / 100 : (totalOutputPct / 100) / pkg.duration;
                const renewablePrinciplePct =
                  pkg.renewablePrinciplePct ?? pkg.principleReturn ?? 70;
                // Round referral % for display so e.g. 10.05% from DB shows as 10%
                const referralPct = Math.round(pkg.referralPct ?? pkg.levelOneReferral ?? 7);
                const binaryPct = pkg.binaryPct || pkg.binaryBonus || 12;
                const powerCapacity = pkg.powerCapacity || pkg.cappingLimit || 1000;
                const status = pkg.status || 'Active';
                const totalRebatePct =
                  pkg.roi != null
                    ? Number((pkg.duration * pkg.roi + renewablePrinciplePct).toFixed(2))
                    : Number((totalOutputPct + renewablePrinciplePct).toFixed(2));

                return (
                  <div key={pkg.id} className={`${t.card} hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-xl font-extrabold" style={{ color: t.ink }}>{pkg.packageName}</h3>
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${status === 'Active' ? t.badgeActive : t.badgeError}`}>
                          {status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className={t.cardHighlight}>
                          <p className="text-xs mb-1 uppercase tracking-wider font-semibold" style={{ color: t.muted }}>Investment Range</p>
                          <p className="text-2xl font-extrabold" style={{ color: t.primary }}>
                            ${pkg.minAmount.toLocaleString()} - ${pkg.maxAmount.toLocaleString()}
                          </p>
                        </div>

                        {[
                          { label: 'Duration', value: `${pkg.duration} days` },
                          { label: 'Total Output', value: `${totalRebatePct}%`, accent: true },
                          { label: 'Daily ROI Rate', value: pkg.roi ? `${pkg.roi}%` : `${(dailyRoiRate * 100).toFixed(4)}%` },
                          { label: 'Renewable Principle', value: `${renewablePrinciplePct}%`, accent: true },
                          { label: 'Referral Bonus', value: `${referralPct}%`, accent: true },
                          { label: 'Binary Bonus', value: `${binaryPct}%`, accent: true },
                          { label: 'Power Capacity', value: `$${powerCapacity.toLocaleString()}` },
                        ].map((row, idx, arr) => (
                          <div key={row.label} className={`flex justify-between items-center py-2 ${idx < arr.length - 1 ? 'border-b border-[#e8f0f3]' : ''}`}>
                            <span className="text-sm font-semibold" style={{ color: t.muted }}>{row.label}:</span>
                            <span className={`text-sm font-bold ${row.accent ? '' : ''}`} style={{ color: row.accent ? t.primary : t.ink }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInvestNow(pkg)}
                        disabled={status !== 'Active'}
                        className={`${t.btnPrimary} w-full py-3.5 text-base`}
                      >
                        {status === 'Active' ? 'Invest Now' : 'Package Inactive'}
                      </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {showInvestModal && selectedPackage && (
          <div className={t.modalOverlay}>
            <div className={`${t.modalPanel} max-h-[90vh] overflow-y-auto`}>
                <h3 className="text-xl font-extrabold mb-5" style={{ color: t.ink }}>Make Investment</h3>

                <div className={`${t.cardHighlight} mb-5`}>
                  <h4 className="font-extrabold mb-3 text-lg" style={{ color: t.ink }}>{selectedPackage.packageName}</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold" style={{ color: t.muted }}>Amount Range:</span>
                      <span className="font-bold" style={{ color: t.primary }}>${selectedPackage.minAmount.toLocaleString()} - ${selectedPackage.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold" style={{ color: t.muted }}>Duration:</span>
                      <span className="font-bold" style={{ color: t.ink }}>{selectedPackage.duration} days</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold mt-1" style={{ color: t.muted }}>Total Output:</span>
                      <div className="text-right">
                        <span className="font-bold block" style={{ color: t.primary }}>
                          {(() => {
                            const renewablePct =
                              selectedPackage.renewablePrinciplePct ??
                              selectedPackage.principleReturn ??
                              70;
                            return selectedPackage.roi !== undefined && selectedPackage.roi !== null
                              ? ((selectedPackage.duration * selectedPackage.roi) + renewablePct).toFixed(2)
                              : (selectedPackage.totalOutputPct || 225);
                          })()}%
                        </span>
                        {selectedPackage.roi !== undefined && selectedPackage.roi !== null && (
                          <span className="text-xs block mt-0.5" style={{ color: t.muted }}>
                            ({selectedPackage.roi}% × {selectedPackage.duration} days + {(selectedPackage.renewablePrinciplePct ?? selectedPackage.principleReturn ?? 70)}% Capital Back)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voucher Selection */}
                {loadingVouchers ? (
                  <div className={`${t.cardInner} mb-5`}>
                    <p className="text-sm" style={{ color: t.muted }}>Loading vouchers...</p>
                  </div>
                ) : availableVouchers.length > 0 ? (
                  <div className={`${t.cardHighlight} mb-5`}>
                    <label className={t.label}>Use Voucher (Optional)</label>
                    <p className="text-xs mb-3 font-medium" style={{ color: t.muted }}>
                      💡 Tip: To use a voucher, you must invest at least 2x the voucher purchase amount. A $100 voucher requires a minimum investment of $200.
                    </p>
                    <select
                      value={selectedVoucherId || ''}
                      onChange={(e) => setSelectedVoucherId(e.target.value || null)}
                      className={`${t.select} mb-3`}
                    >
                      <option value="">No voucher</option>
                      {availableVouchers.map((voucher: any) => {
                        const voucherInvestmentValue = voucher.investmentValue || voucher.amount * 2;
                        return (
                          <option key={voucher.voucherId} value={voucher.voucherId}>
                            ${voucher.amount.toLocaleString()} voucher (Covers up to $${voucherInvestmentValue.toLocaleString()})
                            {voucher.expiry && ` - Expires: ${new Date(voucher.expiry).toLocaleDateString('en-GB', { timeZone: 'Europe/London' })}`}
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
                            <div className="flex justify-between p-2 rounded-lg bg-white border border-[#d8e6ec]">
                              <span className="font-semibold" style={{ color: t.muted }}>Voucher Purchase Amount:</span>
                              <span className="font-bold" style={{ color: t.ink }}>${voucherPurchaseAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-white border border-[#d8e6ec]">
                              <span className="font-semibold" style={{ color: t.muted }}>Voucher Investment Value:</span>
                              <span className="font-bold" style={{ color: t.primary }}>${voucherInvestmentValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-white border border-[#d8e6ec]">
                              <span className="font-semibold" style={{ color: t.muted }}>Your Investment Amount:</span>
                              <span className="font-bold" style={{ color: t.ink }}>${investmentAmount.toLocaleString()}</span>
                            </div>
                            {!meetsMinimumRequirement && investmentAmount > 0 ? (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="text-red-700 font-bold flex items-center mb-2">
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  ⚠️ Minimum Investment Required
                                </div>
                                <div className="text-xs text-red-600">
                                  To use this voucher, you must invest at least <strong>${minimumInvestmentRequired.toLocaleString()}</strong> (2x the voucher purchase amount of ${voucherPurchaseAmount.toLocaleString()}).
                                </div>
                              </div>
                            ) : meetsMinimumRequirement && investmentAmount > 0 && voucherInvestmentValue >= investmentAmount ? (
                              <div className={`${t.cardHighlight} p-4`}>
                                <div className="font-bold flex items-center mb-2" style={{ color: t.primary }}>
                                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  ✓ Voucher covers your investment!
                                </div>
                                <div className="text-xs" style={{ color: t.muted }}>
                                  Your ${investmentAmount.toLocaleString()} investment is fully covered. No additional payment required.
                                </div>
                              </div>
                            ) : meetsMinimumRequirement && investmentAmount > voucherInvestmentValue ? (
                              <div className={`space-y-2 p-3 rounded-lg ${t.cardInner}`}>
                                <div className="flex justify-between">
                                  <span className="font-semibold" style={{ color: t.muted }}>After Voucher:</span>
                                  <span className="font-bold" style={{ color: t.ink }}>${remainingAmount.toLocaleString()}</span>
                                </div>
                                {useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0 && (() => {
                                  const mainWalletToUse = Math.min(mainWalletBalance, remainingAmount);
                                  const finalPayment = remainingAmount - mainWalletToUse;
                                  return (
                                    <>
                                      <div className="flex justify-between border-t border-[#d8e6ec] pt-2 mt-2">
                                        <span className="font-semibold" style={{ color: t.muted }}>Main Wallet:</span>
                                        <span className="font-bold text-blue-700">-${mainWalletToUse.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between border-t-2 border-[#d8e6ec] pt-2 mt-2">
                                        <span className="font-bold" style={{ color: t.primary }}>Amount to Pay:</span>
                                        <span className="font-bold text-lg" style={{ color: t.primary }}>${finalPayment.toLocaleString()}</span>
                                      </div>
                                    </>
                                  );
                                })()}
                                {(!useMainWallet || !mainWalletBalance || mainWalletBalance === 0) && (
                                  <div className="flex justify-between border-t-2 border-[#d8e6ec] pt-2 mt-2">
                                    <span className="font-bold" style={{ color: t.primary }}>Amount to Pay:</span>
                                    <span className="font-bold text-lg" style={{ color: t.primary }}>${remainingAmount.toLocaleString()}</span>
                                  </div>
                                )}
                                {!useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0 && (
                                  <div className="text-xs text-blue-700 mt-2">
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
                  <div className={`${t.cardInner} mb-5`}>
                    <p className="text-sm" style={{ color: t.muted }}>No active vouchers available. <a href="/vouchers" className="font-semibold hover:underline" style={{ color: t.primary }}>Create one?</a></p>
                  </div>
                )}

                {mainWalletBalance !== null && mainWalletBalance > 0 && (
                  <div className="mb-5 p-4 rounded-xl border border-blue-200 bg-blue-50">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMainWallet}
                        onChange={(e) => setUseMainWallet(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-bold" style={{ color: t.ink }}>
                          Use Main Wallet Balance
                        </span>
                        <p className="text-xs mt-1 font-medium" style={{ color: t.muted }}>
                          Available: <span className="font-semibold text-blue-700">${mainWalletBalance.toFixed(2)}</span> • This amount can only be used to activate investment packages
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
                                <div className="mb-2 p-2 rounded-lg bg-white border border-[#d8e6ec]">
                                  <span style={{ color: t.muted }}>After voucher coverage:</span>
                                  <span className="font-semibold ml-2" style={{ color: t.ink }}>${amountAfterVoucher.toFixed(2)}</span>
                                </div>
                              )}
                              {amountAfterVoucher > 0 && (
                                <div className="p-2 bg-blue-100 border border-blue-200 rounded-lg">
                                  <span className="text-blue-800 font-semibold">
                                    ✓ Will use ${mainWalletToUse.toFixed(2)} from main wallet
                                  </span>
                                </div>
                              )}
                              {amountAfterVoucher === 0 && (
                                <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-lg">
                                  <span className="text-emerald-800 font-semibold">
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

                <div className="mb-5">
                  <label className={t.label}>Investment Amount (USD)</label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    min={selectedPackage.minAmount}
                    max={selectedPackage.maxAmount}
                    step="0.01"
                    className={t.input}
                    placeholder={`Enter amount (${selectedPackage.minAmount} - ${selectedPackage.maxAmount})`}
                  />
                  {investAmount && !isNaN(parseFloat(investAmount)) && !selectedVoucherId && (() => {
                    const investmentAmount = parseFloat(investAmount);
                    const mainWalletToUse = useMainWallet && mainWalletBalance !== null && mainWalletBalance > 0
                      ? Math.min(mainWalletBalance, investmentAmount)
                      : 0;
                    const finalPayment = investmentAmount - mainWalletToUse;
                    
                    return (
                      <div className={`mt-4 p-4 rounded-xl ${t.cardInner}`}>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="font-semibold" style={{ color: t.muted }}>Investment Amount:</span>
                            <span className="font-bold" style={{ color: t.ink }}>${investmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {useMainWallet && mainWalletToUse > 0 && (
                            <div className="flex justify-between border-t border-[#d8e6ec] pt-2">
                              <span className="font-semibold" style={{ color: t.muted }}>Main Wallet Applied:</span>
                              <span className="font-bold text-blue-700">-${mainWalletToUse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t-2 border-[#d8e6ec] pt-2">
                            <span className="font-bold" style={{ color: t.primary }}>Amount to Pay:</span>
                            <span className="font-bold text-lg" style={{ color: t.primary }}>${finalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {error && <div className={t.error}>{error}</div>}

                {selectedVoucherId && (() => {
                  const selectedVoucher = availableVouchers.find((v: any) => v.voucherId === selectedVoucherId);
                  if (selectedVoucher) {
                    const voucherPurchaseAmount = selectedVoucher.amount;
                    const minimumInvestmentRequired = voucherPurchaseAmount * 2;
                    const investmentAmount = parseFloat(investAmount) || 0;
                    const meetsMinimumRequirement = investmentAmount >= minimumInvestmentRequired;

                    if (!meetsMinimumRequirement && investmentAmount > 0) {
                      return (
                        <div className={`mb-5 p-4 rounded-xl ${t.cardHighlight}`}>
                          <div className="text-sm font-bold flex items-center mb-2" style={{ color: t.primary }}>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Warning: Minimum Investment Required
                          </div>
                          <div className="text-xs mt-1" style={{ color: t.muted }}>
                            To use this ${voucherPurchaseAmount.toLocaleString()} voucher, you must invest at least <strong style={{ color: t.primary }}>${minimumInvestmentRequired.toLocaleString()}</strong> (2x the voucher purchase amount).
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvestModal(false);
                      setSelectedPackage(null);
                      setInvestAmount('');
                      setSelectedVoucherId(null);
                      setUseMainWallet(false);
                      setError('');
                    }}
                    className={t.btnGhost}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
                    className={t.btnPrimary}
                  >
                    {creatingPayment ? 'Creating Payment…' : 'Proceed to Payment'}
                  </button>
                </div>
            </div>
          </div>
        )}
    </div>
  );
}

