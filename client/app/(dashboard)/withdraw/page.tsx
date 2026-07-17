'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
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
    return <BigBullLoader fullScreen />;
  }

  return (
    <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FBF676]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Withdraw Funds</span>
        </h1>
          </div>
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Target Completion Lock Message (non-free: full lock; free: ROI locked, Binary/Referral allowed) */}
          {targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted && (
            <div className="mb-6 bg-amber-900/30 border-2 border-amber-400/50 text-amber-300 px-6 py-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-400 mb-2">
                    {userProfile?.accountType === 'free' ? 'ROI Withdrawal Locked' : 'Withdrawal Locked'}
                  </h3>
                  <p className="text-amber-300 mb-2">
                    {userProfile?.accountType === 'free'
                      ? "Before target: ROI withdrawal locked. Only Referral + Binary unlocked (can withdraw)."
                      : "Your target is not completed. Complete your binary target to unlock withdrawal."
                    }
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={userProfile?.accountType === 'free' ? 'text-amber-200' : 'text-red-200'}>Target Amount:</span>
                      <span className="text-white font-semibold">${(targetStatus.binaryTargetAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={userProfile?.accountType === 'free' ? 'text-amber-200' : 'text-red-200'}>Left Leg Business:</span>
                      <span className="text-white">${targetStatus.leftBusiness.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={userProfile?.accountType === 'free' ? 'text-amber-200' : 'text-red-200'}>Right Leg Business:</span>
                      <span className="text-white">${targetStatus.rightBusiness.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between border-t pt-1 mt-1 ${userProfile?.accountType === 'free' ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                      <span className={`font-semibold ${userProfile?.accountType === 'free' ? 'text-amber-200' : 'text-red-200'}`}>Total Business:</span>
                      <span className="text-white font-bold">${targetStatus.totalBusiness.toFixed(2)}</span>
                    </div>
                    {targetStatus.message && (
                      <p className={`text-xs mt-2 italic ${userProfile?.accountType === 'free' ? 'text-amber-200' : 'text-red-200'}`}>{targetStatus.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Free Account Info: official rules (before/after target) */}
          {userProfile?.accountType === 'free' && targetStatus && (
            <div className="mb-6 bg-blue-900/30 border-2 border-blue-400/50 text-blue-300 px-6 py-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-400 mb-2">Free Account Withdrawal Rules</h3>
                  {(targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted ? (
                    <p className="text-blue-300 mb-2">
                      Before target: <strong>ROI withdrawal locked</strong>. Only <strong>Referral + Binary unlocked</strong> (can withdraw). Limited to your binary/referral income (wallet balance).
                    </p>
                  ) : (
                    <p className="text-blue-300 mb-2">
                      Target completed. You can withdraw from ROI, Binary, Referral, and other eligible wallets as per system rules.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 p-8 backdrop-blur-md bg-[rgba(8,16,40,0.75)]">
              {binaryTree && binaryTree.cappingLimit > 0 && (
                <div className="mb-6 p-4 bg-[rgba(251,246,118,0.12)] border-2 border-[#FBF676]/35 rounded-xl">
                  <p className="text-sm text-[#FBF676] font-bold">
                    <strong>Capping Limit:</strong> <span className="text-white">${binaryTree.cappingLimit.toFixed(2)}</span> per withdrawal
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-yellow-300 mb-3">
                    Select Wallet
                  </label>
                  <select
                    value={selectedWalletType}
                    onChange={(e) => setSelectedWalletType(e.target.value)}
                    className="w-full px-4 py-3 border border-[#FBF676]/40 rounded-xl bg-[#081028] text-white focus:outline-none focus:ring-2 focus:ring-[#FBF676]/40 focus:border-[#FBF676]/70 font-semibold appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#081028] text-white">
                      Select a wallet
                    </option>
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
                          <option
                            key={wallet.type}
                            value={wallet.type}
                            className="bg-[#081028] text-white"
                          >
                            {label} - Available: ${(wallet.balance - wallet.reserved).toFixed(2)}
                          </option>
                        );
                      })}
                  </select>
                  {userProfile?.accountType === 'free' && (targetStatus?.binaryTargetAmount ?? 0) > 0 && !targetStatus?.isCompleted && (
                    <p className="mt-2 text-sm text-blue-400 font-semibold">
                      Before target: ROI locked; only Referral + Binary unlocked.
                    </p>
                  )}
                </div>

                {selectedWallet && (
                  <>
                    <div className="p-5 bg-[rgba(5,12,32,0.9)] border border-[#FBF676]/30 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#FBF676]/80 font-semibold">Total Balance:</span>
                        <span className="font-extrabold text-white">${selectedWallet.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#FBF676]/80 font-semibold">Reserved:</span>
                        <span className="font-extrabold text-[#FBF676]">${selectedWallet.reserved.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#FBF676]/20">
                        <span className="text-sm font-bold text-[#FBF676]">Available:</span>
                        <span className="text-xl font-extrabold text-[#FBF676]">
                          ${availableBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#FBF676] mb-3">
                        Withdrawal Amount (USD)
                      </label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min={MIN_WITHDRAWAL_AMOUNT}
                        max={availableBalance}
                        step="0.01"
                        className="w-full px-4 py-3 border border-[#FBF676]/40 rounded-xl bg-[#081028] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FBF676]/40 focus:border-[#FBF676]/70 font-semibold"
                        style={{ colorScheme: 'dark' }}
                        placeholder={`Min $${MIN_WITHDRAWAL_AMOUNT}`}
                      />
                      <p className="mt-2 text-xs text-[#FBF676]/80 font-semibold">
                        Minimum: <span className="text-[#FBF676]">${MIN_WITHDRAWAL_AMOUNT}</span>
                        {' | '}
                        Maximum: <span className="text-[#FBF676]">${availableBalance.toFixed(2)}</span>
                        {binaryTree && binaryTree.cappingLimit > 0 && (
                          <> | Capping Limit: <span className="text-[#FBF676]">${binaryTree.cappingLimit.toFixed(2)}</span></>
                        )}
                      </p>
                    </div>

                    {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                      <div className="p-5 bg-[rgba(5,12,32,0.9)] border-2 border-[#FBF676]/35 rounded-xl">
                        <h4 className="font-extrabold text-white mb-4">Withdrawal Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#FBF676]/80 font-semibold">Amount:</span>
                            <span className="font-extrabold text-white">${parseFloat(withdrawAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#FBF676]/80 font-semibold">Charges (5%):</span>
                            <span className="font-extrabold text-[#FBF676]">
                              -${(parseFloat(withdrawAmount) * 0.05).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-[#FBF676]/30">
                            <span className="font-bold text-[#FBF676]">Final Amount:</span>
                            <span className="text-xl font-extrabold text-[#FBF676]">
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
                      className="w-full px-6 py-4 bg-[#FBF676] text-[#0C1A6B] rounded-xl hover:bg-[#e8e04a] font-bold transition-all shadow-lg shadow-[#FBF676]/25 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
                    </button>
                    {!walletAddress && (
                      <p className="mt-3 text-sm text-[#FBF676] text-center font-semibold">
                        Please set your USDT TRC20 wallet address to proceed
                      </p>
                    )}
                    {userProfile?.accountType !== 'free' && targetStatus && (targetStatus.binaryTargetAmount ?? 0) > 0 && !targetStatus.isCompleted && (
                      <p className="mt-3 text-sm text-[#FBF676] text-center font-semibold">
                        Complete your binary target to unlock withdrawal
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Address Section */}
          <div className="mb-8">
            <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 p-8 backdrop-blur-md bg-[rgba(8,16,40,0.75)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <span className="w-1 h-6 rounded" style={{ background: 'linear-gradient(180deg, #FBF676, #05627C)' }}></span>
                  Payment Information
                </h2>
                {!userWalletAddress && (
                  <button
                    onClick={() => {
                      setModalWalletAddress(''); // Reset modal input when opening modal
                      setShowWalletModal(true);
                    }}
                    className="px-6 py-3 bg-[#FBF676] text-[#0C1A6B] rounded-xl hover:bg-[#e8e04a] font-bold transition-all shadow-lg shadow-[#FBF676]/25 hover:shadow-[#FBF676]/30 hover:scale-105 active:scale-95"
                  >
                    Setup Payment Info
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FBF676] mb-3">USDT TRC20 Wallet Address</h3>
                {walletAddress ? (
                  <div className="p-4 bg-[rgba(5,12,32,0.9)] border-2 border-[#FBF676]/35 rounded-xl">
                    <p className="text-sm font-mono text-white break-all font-semibold">{walletAddress}</p>
                    <p className="text-xs text-[#FBF676] mt-2 font-bold">✓ Wallet address configured</p>
                    <p className="text-xs text-white/50 mt-2 font-semibold">
                      Wallet address cannot be changed. Contact admin support if you need to update it.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-[rgba(5,12,32,0.9)] border border-[#FBF676]/30 rounded-xl">
                    <p className="text-sm text-white/80 font-semibold">No wallet address set</p>
                    <p className="text-xs text-[#FBF676] mt-2 font-bold">Required for withdrawals</p>
                    <p className="text-xs text-white/50 mt-2 font-semibold">
                      Supported: USDT TRC20 only
                    </p>
                  </div>
                )}
              </div>
              {!walletAddress && (
                <div className="mt-6 p-5 bg-red-900/30 border border-red-500/50 rounded-xl">
                  <p className="text-sm font-extrabold text-red-400 mb-2">⚠️ Payment Information Required</p>
                  <p className="text-xs text-red-300 font-semibold">
                    You need to set a USDT TRC20 wallet address to request withdrawals.
                  </p>
                  <p className="text-xs text-[#FBF676] mt-2 font-semibold">
                    Only USDT TRC20 wallet addresses are accepted for withdrawals
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal History Section */}
          <div className="mb-10">
            <div className="rounded-2xl shadow-2xl border border-[#FBF676]/25 p-8 backdrop-blur-md bg-[rgba(8,16,40,0.75)]">
              <h2 className="text-2xl font-extrabold mb-6 text-[#FBF676]">
                Withdrawal History
              </h2>
              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-white/50 text-lg">
                  <p>No withdrawal history found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#FBF676]/15">
                    <thead className="bg-[rgba(5,12,32,0.9)]">
                      <tr>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Withdrawal ID</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Charges</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Final Amount</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Wallet Type</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-[#FBF676] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[rgba(5,12,32,0.45)] divide-y divide-[#FBF676]/10">
                      {withdrawals.map((wd) => (
                        <tr key={wd.id} className="hover:bg-[rgba(251,246,118,0.08)] transition-all duration-300 group">
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-white/55">
                            {formatDateTimeLongUK(wd.createdAt)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-[#FBF676] font-semibold">
                            {wd.withdrawalId || wd.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-white">
                            ${wd.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-white/55 font-semibold">
                            ${wd.charges.toFixed(2)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-[#FBF676]">
                            ${wd.finalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-white/75 capitalize font-semibold">
                            {wd.walletType}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm">
                            <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                              wd.status === 'approved' 
                                ? 'bg-[rgba(251,246,118,0.15)] text-[#FBF676] border-[#FBF676]/40'
                                : wd.status === 'pending' 
                                ? 'bg-white/10 text-white/70 border-white/20'
                                : 'bg-red-900/40 text-red-400 border-red-500/40'
                            }`}>
                              {wd.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address Modal */}
          {showWalletModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-6 border border-[#FBF676]/25 w-full max-w-2xl shadow-2xl rounded-2xl backdrop-blur-md bg-[rgba(8,16,40,0.95)]">
                <div className="mt-3">
                  <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Setup Payment Information</span>
                  </h3>
                  <p className="text-sm text-yellow-300 mb-6 font-semibold">
                    Set your USDT TRC20 wallet address to enable withdrawals.
                  </p>
                  <div className="mb-6 p-4 bg-[rgba(251,246,118,0.12)] border-2 border-[#FBF676]/35 rounded-xl">
                    <p className="text-sm font-bold text-[#FBF676] mb-2">Payment Method:</p>
                    <p className="text-xs text-white font-semibold">
                      Only <strong className="text-[#FBF676]">USDT TRC20</strong> wallet addresses are accepted for withdrawals.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#FBF676] mb-3">
                      USDT TRC20 Wallet Address {userWalletAddress && <span className="text-[#FBF676]">(Cannot be changed)</span>}
                    </label>
                    {userWalletAddress ? (
                      <div className="p-4 bg-yellow-900/80 border border-[#FBF676]/25 rounded-xl">
                        <p className="text-sm font-mono text-white break-all font-semibold">{userWalletAddress}</p>
                        <p className="mt-2 text-xs text-red-400 font-bold">
                          ⚠️ Wallet address cannot be changed once set. Contact admin support if you need to update it.
                        </p>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={modalWalletAddress}
                          onChange={(e) => setModalWalletAddress(e.target.value)}
                          onKeyDown={(e) => {
                            // Prevent Enter key from submitting
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          className="w-full px-4 py-3 border border-[#FBF676]/40 rounded-xl bg-[#081028] text-white focus:outline-none focus:ring-2 focus:ring-[#FBF676]/40 focus:border-[#FBF676]/70 font-mono text-sm font-semibold"
                          style={{ colorScheme: 'dark' }}
                          placeholder="Enter your USDT TRC20 wallet address (starts with T)"
                          autoComplete="off"
                        />
                        <p className="mt-2 text-xs text-[#FBF676] font-semibold">
                          Enter your USDT TRC20 wallet address for withdrawals. This can only be set once.
                        </p>
                        <p className="mt-2 text-xs text-[#FBF676] font-bold">
                          💡 USDT TRC20 wallet addresses start with "T" (e.g., Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx).
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWalletModal(false);
                        setModalWalletAddress(''); // Reset modal input on cancel
                      }}
                      className="px-6 py-2.5 text-sm font-bold text-[#FBF676] bg-yellow-900 rounded-xl hover:bg-yellow-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdatePaymentInfo}
                      disabled={!modalWalletAddress || modalWalletAddress.trim().length === 0}
                      className="px-6 py-2.5 text-sm font-bold text-black bg-[#FBF676] rounded-xl hover:bg-[#e8e04a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FBF676]/25 hover:shadow-[#FBF676]/30 hover:scale-105 active:scale-95"
                    >
                      Save
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
