'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';
import { formatDateTimeLongUK } from '@/lib/utils';
interface Wallet {
  type: string;
  balance: number;
  reserved: number;
  currency: string;
}

interface BinaryTreeInfo {
  cappingLimit: number;
}

interface TargetStatus {
  binaryTargetAmount: number;
  targetStatus: 'pending' | 'completed';
  withdrawEnabled: boolean;
  leftBusiness: number;
  rightBusiness: number;
  totalBusiness: number;
  isCompleted: boolean;
  message?: string;
}

interface UserProfile {
  accountType?: 'normal' | 'powerleg' | 'free';
  userId?: string;
  name?: string;
  email?: string;
  walletAddress?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  status: string;
  method: string;
  withdrawalId?: string;
  createdAt: string;
}

const MIN_WITHDRAWAL_AMOUNT = 15;

export default function WithdrawPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [binaryTree, setBinaryTree] = useState<BinaryTreeInfo | null>(null);
  const [targetStatus, setTargetStatus] = useState<TargetStatus | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState(''); // Saved wallet address from profile
  const [modalWalletAddress, setModalWalletAddress] = useState(''); // Temporary input value in modal
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchData();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletsRes, binaryTreeRes, userProfileRes, reportsRes, targetStatusRes] = await Promise.all([
        api.getUserWallets(),
        api.getUserBinaryTree().catch(() => ({ data: null })),
        api.getUserProfile().catch(() => ({ data: null })),
        api.getUserReports().catch(() => ({ data: { withdrawals: [] } })),
        api.getUserTargetStatus().catch(() => ({ data: null })),
      ]);

      if (walletsRes.data) {
        setWallets(walletsRes.data.wallets || []);
        
        // Set user profile if available
        if (userProfileRes.data?.user) {
          setUserProfile(userProfileRes.data.user);
        }
        
        // Free accounts: before target = Binary + Referral only; after target = all wallets
        const isFreeAccount = userProfileRes.data?.user?.accountType === 'free';
        const targetCompleted = targetStatusRes.data?.isCompleted ?? true;
        const freeBeforeTarget = isFreeAccount && (targetStatusRes.data?.binaryTargetAmount ?? 0) > 0 && !targetCompleted;
        const withdrawableWallets = walletsRes.data.wallets.filter((w: Wallet) => {
          if (isFreeAccount) {
            if (freeBeforeTarget) return w.type === 'binary' || w.type === 'referral';
            return ['roi', 'interest', 'referral', 'binary', 'career_level'].includes(w.type);
          }
          return ['roi', 'interest', 'referral', 'binary', 'career_level'].includes(w.type);
        });
        
        if (withdrawableWallets.length > 0 && !selectedWalletType) {
          setSelectedWalletType(withdrawableWallets[0].type);
        }
      }
      if (binaryTreeRes.data) {
        setBinaryTree({
          cappingLimit: binaryTreeRes.data.binaryTree.cappingLimit || 0,
        });
      }
      if (userProfileRes.data?.user) {
        setUserProfile(userProfileRes.data.user);
        if (userProfileRes.data.user.walletAddress) {
          setUserWalletAddress(userProfileRes.data.user.walletAddress);
          setWalletAddress(userProfileRes.data.user.walletAddress);
        }
      }
      if (reportsRes.data?.withdrawals) {
        setWithdrawals(reportsRes.data.withdrawals || []);
      }
      if (targetStatusRes.data) {
        setTargetStatus(targetStatusRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    // For non-free accounts: require target completion to withdraw
    const isFreeAccount = userProfile?.accountType === 'free';
    if (!isFreeAccount && targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted) {
      const errorMsg = targetStatus.message || 'Your target is not completed. Complete your binary target to unlock withdrawal.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Check wallet address
    if (!walletAddress) {
      const errorMsg = 'USDT TRC20 wallet address is required. Please set your wallet address before requesting a withdrawal.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!selectedWalletType) {
      const errorMsg = 'Please select a wallet';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      const errorMsg = 'Please enter a valid amount';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      const errorMsg = `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const selectedWallet = wallets.find((w) => w.type === selectedWalletType);
    if (!selectedWallet) {
      const errorMsg = 'Selected wallet not found';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const availableBalance = selectedWallet.balance - selectedWallet.reserved;
    if (amount > availableBalance) {
      const errorMsg = `Insufficient balance. Available: $${availableBalance.toFixed(2)}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (binaryTree && binaryTree.cappingLimit > 0 && amount > binaryTree.cappingLimit) {
      const errorMsg = `Amount exceeds capping limit of $${binaryTree.cappingLimit.toFixed(2)}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setWithdrawing(true);
      setError('');
      const response = await api.createWithdrawal({
        amount,
        walletType: selectedWalletType,
        method: 'crypto',
      });

      if (response.data) {
        toast.success('Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        await fetchData();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Withdrawal failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleUpdatePaymentInfo = async () => {
    // Validate wallet address is not empty
    if (!modalWalletAddress || modalWalletAddress.trim().length === 0) {
      const errorMsg = 'Please enter a USDT TRC20 wallet address';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Additional validation - ensure it's not just whitespace
    const trimmedAddress = modalWalletAddress.trim();
    if (trimmedAddress.length < 10) {
      const errorMsg = 'Wallet address seems too short. Please enter a valid USDT TRC20 wallet address.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Validate USDT TRC20 address format (should start with T)
    if (!trimmedAddress.startsWith('T')) {
      const errorMsg = 'Invalid USDT TRC20 address. USDT TRC20 addresses must start with "T".';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    try {
      setError('');
      await api.updateWalletAddress({ 
        walletAddress: trimmedAddress
      });
      setShowWalletModal(false);
      setModalWalletAddress(''); // Clear modal input after successful save
      toast.success('Payment information updated successfully!');
      await fetchData();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update payment information';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Wallet order: ROI, Referral, Binary Bonus, Career Level, Interest, Token, Investment, Withdrawal
  const walletOrder = ['roi', 'referral', 'binary', 'career_level', 'interest', 'token', 'investment', 'withdrawal', 'fixed'];
  
  const sortWallets = (wallets: Wallet[]): Wallet[] => {
    return [...wallets].sort((a, b) => {
      const indexA = walletOrder.indexOf(a.type);
      const indexB = walletOrder.indexOf(b.type);
      // If type not found in order, put it at the end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const selectedWallet = wallets.find((w) => w.type === selectedWalletType);
  const availableBalance = selectedWallet
    ? selectedWallet.balance - selectedWallet.reserved
    : 0;

  if (loading) {
    return <BigBullLoader text="Loading withdraw…" />;
  }

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>Withdraw Funds</h1>
        <p className={t.subtitle}>Request payouts from your eligible wallets</p>
      </div>

      {error && <div className={t.error}>{error}</div>}

          {/* Target Completion Lock Message (non-free: full lock; free: ROI locked, Binary/Referral allowed) */}
          {targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted && (
            <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 sm:px-6">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-base font-bold text-amber-800 sm:text-lg">
                    {userProfile?.accountType === 'free' ? 'ROI Withdrawal Locked' : 'Withdrawal Locked'}
                  </h3>
                  <p className="mb-2 text-sm text-amber-900/80 sm:text-base">
                    {userProfile?.accountType === 'free'
                      ? "Before target: ROI withdrawal locked. Only Referral + Binary unlocked (can withdraw)."
                      : "Your target is not completed. Complete your binary target to unlock withdrawal."
                    }
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-800/80">Target Amount:</span>
                      <span className="font-semibold text-amber-950">${(targetStatus.binaryTargetAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-800/80">Left Leg Business:</span>
                      <span className="text-amber-950">${targetStatus.leftBusiness.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-800/80">Right Leg Business:</span>
                      <span className="text-amber-950">${targetStatus.rightBusiness.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex justify-between gap-2 border-t border-amber-200 pt-1">
                      <span className="font-semibold text-amber-800">Total Business:</span>
                      <span className="font-bold text-amber-950">${targetStatus.totalBusiness.toFixed(2)}</span>
                    </div>
                    {targetStatus.message && (
                      <p className="mt-2 text-xs italic text-amber-800/70">{targetStatus.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Free Account Info: official rules (before/after target) */}
          {userProfile?.accountType === 'free' && targetStatus && (
            <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-4 text-blue-950 sm:px-6">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-base font-bold text-blue-800 sm:text-lg">Free Account Withdrawal Rules</h3>
                  {(targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted ? (
                    <p className="mb-2 text-sm text-blue-900/80 sm:text-base">
                      Before target: <strong>ROI withdrawal locked</strong>. Only <strong>Referral + Binary unlocked</strong> (can withdraw). Limited to your binary/referral income (wallet balance).
                    </p>
                  ) : (
                    <p className="mb-2 text-sm text-blue-900/80 sm:text-base">
                      Target completed. You can withdraw from ROI, Binary, Referral, and other eligible wallets as per system rules.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={t.card}>
              {binaryTree && binaryTree.cappingLimit > 0 && (
                <div className={`mb-6 p-4 rounded-xl ${t.cardHighlight}`}>
                  <p className="text-sm font-bold" style={{ color: t.primary }}>
                    <strong>Capping Limit:</strong>{' '}
                    <span style={{ color: t.ink }}>${binaryTree.cappingLimit.toFixed(2)}</span> per withdrawal
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className={t.label}>Select Wallet</label>
                  <select
                    value={selectedWalletType}
                    onChange={(e) => setSelectedWalletType(e.target.value)}
                    className={t.select}
                  >
                    <option value="">Select a wallet</option>
                    {sortWallets(wallets
                      .filter((w) => {
                        // Free: before target = binary + referral only; after target = all
                        if (userProfile?.accountType === 'free') {
                          if ((targetStatus?.binaryTargetAmount ?? 0) > 0 && !targetStatus?.isCompleted) {
                            return w.type === 'binary' || w.type === 'referral';
                          }
                          return ['roi', 'interest', 'referral', 'binary', 'career_level'].includes(w.type);
                        }
                        return ['roi', 'interest', 'referral', 'binary', 'career_level'].includes(w.type);
                      }))
                      .map((wallet) => {
                        const label =
                          wallet.type === 'career_level'
                            ? 'Career Level'
                            : wallet.type === 'referral'
                            ? 'Referral Wallet'
                            : wallet.type === 'binary'
                            ? 'Binary Wallet'
                            : wallet.type === 'roi'
                            ? 'ROI Wallet'
                            : wallet.type === 'interest'
                            ? 'Interest Wallet'
                            : wallet.type;
                        return (
                          <option key={wallet.type} value={wallet.type}>
                            {label} - Available: ${(wallet.balance - wallet.reserved).toFixed(2)}
                          </option>
                        );
                      })}
                  </select>
                  {userProfile?.accountType === 'free' && (targetStatus?.binaryTargetAmount ?? 0) > 0 && !targetStatus?.isCompleted && (
                    <p className="mt-2 text-sm font-semibold text-blue-700">
                      Before target: ROI locked; only Referral + Binary unlocked.
                    </p>
                  )}
                </div>

                {selectedWallet && (
                  <>
                    <div className={`p-5 rounded-xl ${t.cardInner}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#5A6F78] font-semibold">Total Balance:</span>
                        <span className="font-extrabold text-white">${selectedWallet.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#5A6F78] font-semibold">Reserved:</span>
                        <span className="font-extrabold text-[#05627C]">${selectedWallet.reserved.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#d8e6ec]">
                        <span className="text-sm font-bold text-[#05627C]">Available:</span>
                        <span className="text-xl font-extrabold text-[#05627C]">
                          ${availableBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={t.label}>Withdrawal Amount (USD)</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min={MIN_WITHDRAWAL_AMOUNT}
                        max={availableBalance}
                        step="0.01"
                        className={t.input}
                        placeholder={`Min $${MIN_WITHDRAWAL_AMOUNT}`}
                      />
                      <p className="mt-2 text-xs font-semibold" style={{ color: t.muted }}>
                        Minimum: <span style={{ color: t.primary }}>${MIN_WITHDRAWAL_AMOUNT}</span>
                        {' | '}
                        Maximum: <span style={{ color: t.primary }}>${availableBalance.toFixed(2)}</span>
                        {binaryTree && binaryTree.cappingLimit > 0 && (
                          <> | Capping Limit: <span className="text-[#05627C]">${binaryTree.cappingLimit.toFixed(2)}</span></>
                        )}
                      </p>
                    </div>

                    {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                      <div className={`p-5 rounded-xl ${t.cardHighlight}`}>
                        <h4 className="font-extrabold mb-4" style={{ color: t.ink }}>Withdrawal Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#5A6F78] font-semibold">Amount:</span>
                            <span className="font-extrabold text-white">${parseFloat(withdrawAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5A6F78] font-semibold">Charges (5%):</span>
                            <span className="font-extrabold text-[#05627C]">
                              -${(parseFloat(withdrawAmount) * 0.05).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-[#d8e6ec]">
                            <span className="font-bold text-[#05627C]">Final Amount:</span>
                            <span className="text-xl font-extrabold text-[#05627C]">
                              ${(parseFloat(withdrawAmount) * 0.95).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleWithdraw}
                      disabled={Boolean(
                        withdrawing || 
                        !withdrawAmount || 
                        parseFloat(withdrawAmount) < MIN_WITHDRAWAL_AMOUNT || 
                        !walletAddress ||
                        // Non-free accounts: require target completed to withdraw
                        (userProfile?.accountType !== 'free' && targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted)
                      )}
                      className={`${t.btnPrimary} w-full py-4`}
                    >
                      {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
                    </button>
                    {!walletAddress && (
                      <p className="mt-3 text-sm text-center font-semibold" style={{ color: t.primary }}>
                        Please set your USDT TRC20 wallet address to proceed
                      </p>
                    )}
                    {userProfile?.accountType !== 'free' && targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted && (
                      <p className="mt-3 text-sm text-center font-semibold" style={{ color: t.primary }}>
                        Complete your binary target to unlock withdrawal
                      </p>
                    )}
                  </>
                )}
              </div>
          </div>

          <div className={t.card}>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <h2 className={`${t.sectionTitle} flex items-center gap-2`}>
                  <span className={t.accentBar} style={t.accentBarStyle} />
                  Payment Information
                </h2>
                {!userWalletAddress && (
                  <button type="button" onClick={() => { setModalWalletAddress(''); setShowWalletModal(true); }} className={t.btnPrimary}>
                    Setup Payment Info
                  </button>
                )}
              </div>
              <div>
                <h3 className={t.label}>USDT TRC20 Wallet Address</h3>
                {walletAddress ? (
                  <div className={`p-4 rounded-xl ${t.cardInner}`}>
                    <p className="text-sm font-mono break-all font-semibold" style={{ color: t.ink }}>{walletAddress}</p>
                    <p className="text-xs text-emerald-700 mt-2 font-bold">✓ Wallet address configured</p>
                    <p className="text-xs mt-2 font-medium" style={{ color: t.muted }}>
                      Wallet address cannot be changed. Contact admin support if you need to update it.
                    </p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl ${t.cardInner}`}>
                    <p className="text-sm font-semibold" style={{ color: t.ink }}>No wallet address set</p>
                    <p className="text-xs mt-2 font-bold" style={{ color: t.primary }}>Required for withdrawals</p>
                    <p className="text-xs mt-2 font-medium" style={{ color: t.muted }}>Supported: USDT TRC20 only</p>
                  </div>
                )}
              </div>
              {!walletAddress && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm font-extrabold text-red-700 mb-2">⚠️ Payment Information Required</p>
                  <p className="text-xs text-red-600 font-medium">
                    You need to set a USDT TRC20 wallet address to request withdrawals.
                  </p>
                </div>
              )}
          </div>

          <div className={t.card}>
              <h2 className={`${t.sectionTitle} mb-6`}>Withdrawal History</h2>
              {withdrawals.length === 0 ? (
                <div className="text-center py-10 font-medium" style={{ color: t.muted }}>
                  <p>No withdrawal history found</p>
                </div>
              ) : (
                <div className={t.tableWrap}>
                  <div className="overflow-x-auto">
                    <table className={t.table}>
                      <thead className={t.tableHead}>
                        <tr>
                          {['Date', 'Withdrawal ID', 'Amount', 'Charges', 'Final Amount', 'Wallet Type', 'Status'].map((h) => (
                            <th key={h} className={t.tableHeadCell}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={t.tableBody}>
                        {withdrawals.map((wd) => (
                          <tr key={wd.id} className={t.tableRow}>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm" style={{ color: t.muted }}>
                              {formatDateTimeLongUK(wd.createdAt)}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold" style={{ color: t.primary }}>
                              {wd.withdrawalId || wd.id.substring(0, 8)}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: t.ink }}>${wd.amount.toFixed(2)}</td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: t.muted }}>${wd.charges.toFixed(2)}</td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-extrabold" style={{ color: t.primary }}>${wd.finalAmount.toFixed(2)}</td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm capitalize font-semibold" style={{ color: t.muted }}>{wd.walletType}</td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${wd.status === 'approved' ? t.badgeActive : wd.status === 'pending' ? t.badgePending : t.badgeError}`}>
                                {wd.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {showWalletModal && (
            <div className={t.modalOverlay}>
              <div className={`${t.modalPanel} max-w-2xl`}>
                  <h3 className="text-xl font-extrabold mb-2" style={{ color: t.ink }}>Setup Payment Information</h3>
                  <p className="text-sm mb-6 font-medium" style={{ color: t.muted }}>
                    Set your USDT TRC20 wallet address to enable withdrawals.
                  </p>
                  <div className={`mb-6 p-4 rounded-xl ${t.cardHighlight}`}>
                    <p className="text-sm font-bold mb-2" style={{ color: t.primary }}>Payment Method:</p>
                    <p className="text-xs font-medium" style={{ color: t.ink }}>
                      Only <strong>USDT TRC20</strong> wallet addresses are accepted for withdrawals.
                    </p>
                  </div>
                  
                  <div>
                    <label className={t.label}>
                      USDT TRC20 Wallet Address {userWalletAddress && <span style={{ color: t.muted }}>(Cannot be changed)</span>}
                    </label>
                    {userWalletAddress ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm font-mono break-all font-semibold" style={{ color: t.ink }}>{userWalletAddress}</p>
                        <p className="mt-2 text-xs text-red-700 font-bold">
                          ⚠️ Wallet address cannot be changed once set. Contact admin support if you need to update it.
                        </p>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={modalWalletAddress}
                          onChange={(e) => setModalWalletAddress(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                          className={`${t.input} font-mono text-sm`}
                          placeholder="Enter your USDT TRC20 wallet address (starts with T)"
                          autoComplete="off"
                        />
                        <p className="mt-2 text-xs font-medium" style={{ color: t.muted }}>
                          Enter your USDT TRC20 wallet address for withdrawals. This can only be set once.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => { setShowWalletModal(false); setModalWalletAddress(''); }} className={t.btnGhost}>
                      Cancel
                    </button>
                    <button type="button" onClick={handleUpdatePaymentInfo} disabled={!modalWalletAddress || modalWalletAddress.trim().length === 0} className={t.btnPrimary}>
                      Save
                    </button>
                  </div>
              </div>
            </div>
          )}
    </div>
  );
}
