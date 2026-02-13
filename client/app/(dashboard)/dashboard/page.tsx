'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import CrownLoader from '@/components/CrownLoader';
import Image from 'next/image';

interface Wallet {
  type: string;
  balance: number;
  reserved: number;
  currency: string;
}

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
}

interface BinaryTreeInfo {
  parent: {
    id: string;
    userId: string;
    name: string;
  } | null;
  treeParent?: {
    id: string;
    userId: string;
    name: string;
  } | null; // Optional: actual binary tree placement parent (may differ from referrer)
  leftChild: {
    id: string;
    userId: string;
    name: string;
  } | null;
  rightChild: {
    id: string;
    userId: string;
    name: string;
  } | null;
  leftBusiness: number;
  rightBusiness: number;
  leftCarry: number;
  rightCarry: number;
  leftDownlines: number;
  rightDownlines: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [binaryTree, setBinaryTree] = useState<BinaryTreeInfo | null>(null);
  const [referralLinks, setReferralLinks] = useState<{ leftLink: string; rightLink: string; userId: string } | null>(null);
  const [walletAddress, setWalletAddress] = useState(''); // Saved wallet address from profile
  const [modalWalletAddress, setModalWalletAddress] = useState(''); // Temporary input value in modal
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voucherCount, setVoucherCount] = useState<{ total: number; active: number; used: number; expired: number }>({ total: 0, active: 0, used: 0, expired: 0 });
  const [directReferrals, setDirectReferrals] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const hasFetchedRef = useRef(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Prevent duplicate calls (React StrictMode in development)
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    fetchDashboardData();
    fetchVoucherCount();

    // No cleanup - we want to prevent duplicate calls even on remount
  }, []);

  const fetchVoucherCount = async () => {
    try {
      const response = await api.getUserVouchers();
      if (response.data?.vouchers) {
        const vouchers = response.data.vouchers;
        const now = new Date();
        const active = vouchers.filter((v: any) => {
          if (v.status !== 'active') return false;
          if (v.expiry) {
            return new Date(v.expiry) > now;
          }
          return true;
        }).length;
        const used = vouchers.filter((v: any) => v.status === 'used').length;
        const expired = vouchers.filter((v: any) => {
          if (v.expiry) {
            return new Date(v.expiry) <= now;
          }
          return false;
        }).length;
        
        setVoucherCount({
          total: vouchers.length,
          active,
          used,
          expired,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch voucher count:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [walletsRes, investmentsRes, binaryTreeRes, referralLinksRes, userProfileRes, directReferralsRes] = await Promise.all([
        api.getUserWallets(),
        api.getUserInvestments(),
        api.getUserBinaryTree().catch(() => ({ data: null })), // Don't fail if binary tree not found
        api.getUserReferralLinks().catch(() => ({ data: null })), // Don't fail if referral links not found
        api.getUserProfile().catch(() => ({ data: null })), // Get user profile for wallet address
        api.getUserDirectReferrals().catch(() => ({ data: { referrals: [], count: 0 } })), // Don't fail if no referrals
      ]);

      if (walletsRes.data) setWallets(walletsRes.data.wallets);
      if (investmentsRes.data) setInvestments(investmentsRes.data.investments);
      if (binaryTreeRes.data) setBinaryTree(binaryTreeRes.data.binaryTree);
      if (referralLinksRes.data) setReferralLinks(referralLinksRes.data);
      if (userProfileRes.data?.user) {
        if (userProfileRes.data.user.walletAddress) {
          setWalletAddress(userProfileRes.data.user.walletAddress);
        }
      }
      if (directReferralsRes.data) {
        setDirectReferrals(directReferralsRes.data.referrals || []);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getWalletDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      withdrawal: 'Withdrawal',
      roi: 'ROI',
      interest: 'Interest',
      referral: 'Referral',
      binary: 'Binary Bonus',
      token: 'Token',
      investment: 'Investment',
      career_level: 'Career Level',
      main: 'Main Wallet',
      fixed: 'Fixed Wallet',
    };
    return names[type] || type;
  };

  // Calculate responsive font size based on number length
  const getAmountFontSize = (amount: number, isMobile: boolean) => {
    const amountStr = amount.toFixed(2);
    const length = amountStr.length;
    
    if (isMobile) {
      // Mobile: base 1.5rem, shrink by 0.1rem per digit over 6
      const baseSize = 1.5;
      const shrinkRate = 0.1;
      const minSize = 0.75;
      const calculatedSize = Math.max(baseSize - (length - 6) * shrinkRate, minSize);
      return `${calculatedSize}rem`;
    } else {
      // Desktop: base 3rem, shrink by 0.25rem per digit over 6
      const baseSize = 3;
      const shrinkRate = 0.25;
      const minSize = 1.5;
      const calculatedSize = Math.max(baseSize - (length - 6) * shrinkRate, minSize);
      return `${calculatedSize}rem`;
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

  if (loading) {
    return <CrownLoader fullScreen />;
  }

  return (
        <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
          {/* Dashboard Background Image */}
          <div className="fixed inset-0 z-0">
            <Image
              src="/dash.png"
              alt="Dashboard Background"
              fill
              priority
              className="object-cover object-center"
              quality={90}
              sizes="100vw"
            />
            {/* Dark overlay for better content readability with stunning opacity effect */}
            <div className="absolute inset-0 bg-black/60"></div>
            {/* Subtle gradient overlay to blend with theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40"></div>
          </div>

          <div className="relative z-10">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm animate-fade-in-up animation-delay-100">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
         
          {/* Wallets Section */}
          <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-100">
            <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 text-white flex items-center gap-2 md:gap-3">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Wallets</span>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {sortWallets(wallets).map((wallet, index) => (
                <div 
                  key={wallet.type} 
                  className="group relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 p-3 md:p-6 hover:border-yellow-500/60 hover:shadow-yellow-500/20 transition-all duration-300 overflow-hidden animate-scale-in"
                  style={{ 
                    animationDelay: `${0.2 + index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  {/* Animated gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:via-yellow-500/10 group-hover:to-yellow-500/5 transition-all duration-500"></div>
                  <div className="relative z-10">
                    <h3 className="text-xs md:text-lg font-bold text-gray-200 mb-2 md:mb-3 group-hover:text-white transition-colors truncate">
                      {getWalletDisplayName(wallet.type)}
                    </h3>
                    <p 
                      className="font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mt-1 md:mt-2 drop-shadow-lg whitespace-nowrap overflow-hidden"
                      style={{
                        fontSize: getAmountFontSize(wallet.balance, isMobile),
                        lineHeight: '1.1'
                      }}
                    >
                      ${wallet.balance.toFixed(2)}
                    </p>
                    {wallet.reserved > 0 && (
                      <p className="text-[10px] md:text-sm text-gray-400 mt-2 md:mt-3 flex items-center gap-1 md:gap-2">
                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
                        <span className="truncate">Reserved: <span className="text-yellow-400 font-semibold">${wallet.reserved.toFixed(2)}</span></span>
                      </p>
                    )}
                    <p className="text-[9px] md:text-xs text-gray-500 mt-2 md:mt-3 uppercase tracking-wider font-medium truncate">{wallet.currency}</p>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Investments Section */}
          <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-300">
            <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 text-white flex items-center gap-2 md:gap-3">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Investments</span>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
            </h2>
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden animate-scale-in animation-delay-400">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-yellow-500/10">
                      <thead className="bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800">
                        <tr>
                          <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Package</th>
                          <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Amount</th>
                          <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">ROI</th>
                          <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Date</th>
                          <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900/50 divide-y divide-yellow-500/10">
                        {investments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-400 text-sm md:text-lg">
                              No investments yet
                            </td>
                          </tr>
                        ) : (
                          investments.map((inv, index) => (
                            <tr 
                              key={inv.id} 
                              className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group animate-fade-in"
                              style={{ 
                                animationDelay: `${0.5 + index * 0.05}s`,
                                opacity: 0
                              }}
                            >
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-bold text-white group-hover:text-yellow-100 transition-colors">
                                {inv.package?.name || 'N/A'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-yellow-400 font-extrabold group-hover:text-yellow-300 transition-colors">
                                ${inv.investedAmount.toFixed(2)}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-200 font-semibold">
                                {inv.package?.roi || 0}%
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-400">
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap">
                                <span
                                  className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                                    inv.isBinaryUpdated
                                      ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                                      : 'bg-gray-700/50 text-yellow-200 border border-yellow-500/30'
                                  }`}
                                >
                                  {inv.isBinaryUpdated ? 'Active' : 'Processing'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Links Section */}
          {referralLinks && (
            <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-500">
              <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 text-white flex items-center gap-2 md:gap-3">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Referral Links</span>
                <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
              </h2>
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 p-4 md:p-8 animate-scale-in animation-delay-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="group relative p-4 md:p-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent rounded-xl md:rounded-2xl border-2 border-yellow-500/40 hover:border-yellow-500/70 hover:shadow-yellow-500/30 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-in-left animation-delay-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-yellow-400 mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-sm md:text-lg">
                        <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50"></span>
                        Left Referral Link
                      </h3>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                        <input
                          type="text"
                          value={referralLinks.leftLink}
                          readOnly
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-yellow-500/40 rounded-lg md:rounded-xl bg-gray-900/80 text-white text-xs md:text-sm focus:outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/30 font-mono backdrop-blur-sm break-all"
                        />
                        <button
                          onClick={async () => {
                            try {
                              // Try modern clipboard API first
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(referralLinks.leftLink);
                                toast.success('Left referral link copied!');
                              } else {
                                // Fallback for older browsers or non-secure contexts
                                const textArea = document.createElement('textarea');
                                textArea.value = referralLinks.leftLink;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                textArea.style.top = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  const successful = document.execCommand('copy');
                                  if (successful) {
                                    toast.success('Left referral link copied!');
                                  } else {
                                    throw new Error('Copy command failed');
                                  }
                                } catch (err) {
                                  toast.error('Failed to copy link. Please copy manually.');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            } catch (err) {
                              console.error('Failed to copy:', err);
                              toast.error('Failed to copy link. Please copy manually.');
                            }
                          }}
                          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg md:rounded-xl hover:from-yellow-400 hover:to-yellow-500 text-xs md:text-sm font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="group relative p-4 md:p-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent rounded-xl md:rounded-2xl border-2 border-yellow-500/40 hover:border-yellow-500/70 hover:shadow-yellow-500/30 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-in-right animation-delay-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-yellow-400 mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-sm md:text-lg">
                        <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50"></span>
                        Right Referral Link
                      </h3>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                        <input
                          type="text"
                          value={referralLinks.rightLink}
                          readOnly
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-yellow-500/40 rounded-lg md:rounded-xl bg-gray-900/80 text-white text-xs md:text-sm focus:outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/30 font-mono backdrop-blur-sm break-all"
                        />
                        <button
                          onClick={async () => {
                            try {
                              // Try modern clipboard API first
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(referralLinks.rightLink);
                                toast.success('Right referral link copied!');
                              } else {
                                // Fallback for older browsers or non-secure contexts
                                const textArea = document.createElement('textarea');
                                textArea.value = referralLinks.rightLink;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                textArea.style.top = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  const successful = document.execCommand('copy');
                                  if (successful) {
                                    toast.success('Right referral link copied!');
                                  } else {
                                    throw new Error('Copy command failed');
                                  }
                                } catch (err) {
                                  toast.error('Failed to copy link. Please copy manually.');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            } catch (err) {
                              console.error('Failed to copy:', err);
                              toast.error('Failed to copy link. Please copy manually.');
                            }
                          }}
                          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg md:rounded-xl hover:from-yellow-400 hover:to-yellow-500 text-xs md:text-sm font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Direct Referrals Section */}
          <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-600">
            <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 text-white flex items-center gap-2 md:gap-3">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Direct Referrals</span>
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
            </h2>
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 overflow-hidden animate-scale-in animation-delay-700">
              {directReferrals.length === 0 ? (
                <div className="p-6 md:p-12 text-center text-gray-400 text-sm md:text-base">
                  You don't have any direct referrals yet. Share your referral links to start building your team.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-yellow-500/10">
                        <thead className="bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800">
                          <tr>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">User ID</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Name</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Email</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Phone</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Position</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Country</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Joined At</th>
                            <th className="px-3 md:px-6 py-3 md:py-5 text-left text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-900/50 divide-y divide-yellow-500/10">
                          {directReferrals.map((ref, index) => (
                            <tr 
                              key={ref.id} 
                              className="hover:bg-gradient-to-r hover:from-yellow-500/5 hover:via-yellow-500/10 hover:to-transparent transition-all duration-300 group animate-fade-in"
                              style={{ 
                                animationDelay: `${0.8 + index * 0.05}s`,
                                opacity: 0
                              }}
                            >
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm font-mono font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                {ref.userId || 'N/A'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-white font-bold group-hover:text-yellow-100 transition-colors">
                                {ref.name || 'N/A'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-200">
                                {ref.email || '—'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-400">
                                {ref.phone || '—'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-200 capitalize font-semibold">
                                {ref.position || '—'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-400">
                                {ref.country || '—'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm text-gray-400">
                                {ref.joinedAt ? new Date(ref.joinedAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-5 whitespace-nowrap text-xs md:text-sm">
                                <span
                                  className={`px-2 md:px-4 py-1 md:py-1.5 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full shadow-lg ${
                                    ref.status === 'active'
                                      ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-300 border border-yellow-500/50 shadow-yellow-500/20'
                                      : ref.status === 'blocked' || ref.status === 'suspended'
                                      ? 'bg-red-900/40 text-red-400 border border-red-500/40'
                                      : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                                  }`}
                                >
                                  {ref.status || 'unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Binary Tree Info Section */}
          {binaryTree && (
            <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-700">
              <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-8 text-white flex items-center gap-2 md:gap-3">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Binary Tree Information</span>
                <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
              </h2>
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 p-4 md:p-8 animate-scale-in animation-delay-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-yellow-400 mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1 h-4 md:h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
                      Business Values
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="group flex justify-between items-center p-3 md:p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 rounded-xl md:rounded-2xl border border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 animate-fade-in animation-delay-900">
                        <span className="font-bold text-gray-200 text-sm md:text-base">Left Business:</span>
                        <span className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">${binaryTree.leftBusiness.toFixed(2)}</span>
                      </div>
                      <div className="group flex justify-between items-center p-3 md:p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 rounded-xl md:rounded-2xl border border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 animate-fade-in animation-delay-1000">
                        <span className="font-bold text-gray-200 text-sm md:text-base">Right Business:</span>
                        <span className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">${binaryTree.rightBusiness.toFixed(2)}</span>
                      </div>
                      <div className="group flex justify-between items-center p-3 md:p-5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/15 rounded-xl md:rounded-2xl border-2 border-yellow-500/50 hover:border-yellow-500/70 hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 animate-fade-in animation-delay-1100">
                        <span className="font-bold text-white text-sm md:text-base">Min Business:</span>
                        <span className="text-lg md:text-2xl font-extrabold text-yellow-400">
                          ${Math.min(binaryTree.leftBusiness, binaryTree.rightBusiness).toFixed(2)}
                        </span>
                      </div>
                      <div className="group flex justify-between items-center p-4 md:p-6 bg-gradient-to-r from-yellow-500/30 via-yellow-600/20 to-yellow-500/30 rounded-xl md:rounded-2xl border-2 border-yellow-500/60 shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 animate-scale-in animation-delay-1200">
                        <span className="font-extrabold text-white text-sm md:text-lg">Binary Bonus (10%):</span>
                        <span className="text-xl md:text-3xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                          ${(Math.min(binaryTree.leftBusiness, binaryTree.rightBusiness) * 0.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-yellow-400 mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1 h-4 md:h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
                      Carry Forward
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="group flex justify-between items-center p-3 md:p-5 bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl md:rounded-2xl border border-gray-700/50 hover:border-yellow-500/30 hover:shadow-lg transition-all duration-300 animate-fade-in animation-delay-900">
                        <span className="font-bold text-gray-300 text-sm md:text-base">Left Carry:</span>
                        <span className="text-lg md:text-2xl font-extrabold text-white">${binaryTree.leftCarry.toFixed(2)}</span>
                      </div>
                      <div className="group flex justify-between items-center p-3 md:p-5 bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-xl md:rounded-2xl border border-gray-700/50 hover:border-yellow-500/30 hover:shadow-lg transition-all duration-300 animate-fade-in animation-delay-1000">
                        <span className="font-bold text-gray-300 text-sm md:text-base">Right Carry:</span>
                        <span className="text-lg md:text-2xl font-extrabold text-white">${binaryTree.rightCarry.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-yellow-500/30">
                        <h4 className="font-bold text-yellow-400 mb-3 md:mb-4 text-base md:text-lg">Downlines</h4>
                        <div className="flex justify-between text-xs md:text-sm p-3 md:p-4 bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-lg md:rounded-xl border border-gray-700/50">
                          <span className="text-gray-300 font-semibold">Left Downlines:</span>
                          <span className="font-extrabold text-yellow-400 text-base md:text-lg">{binaryTree.leftDownlines}</span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm mt-2 md:mt-3 p-3 md:p-4 bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-lg md:rounded-xl border border-gray-700/50">
                          <span className="text-gray-300 font-semibold">Right Downlines:</span>
                          <span className="font-extrabold text-yellow-400 text-base md:text-lg">{binaryTree.rightDownlines}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(binaryTree.parent || binaryTree.leftChild || binaryTree.rightChild) && (
                  <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-yellow-500/30">
                    <h3 className="text-lg md:text-xl font-extrabold text-yellow-400 mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1 h-4 md:h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
                      Tree Connections
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {binaryTree.parent && (
                        <div className="group p-4 md:p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl md:rounded-2xl border border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 animate-scale-in animation-delay-1300">
                          <p className="text-[10px] md:text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Parent</p>
                          <p className="font-extrabold text-white text-base md:text-lg mb-1 truncate">{binaryTree.parent.name}</p>
                          <p className="text-[10px] md:text-xs text-yellow-400 font-mono font-semibold truncate">{binaryTree.parent.userId}</p>
                        </div>
                      )}
                      {binaryTree.leftChild && (
                        <div className="group p-4 md:p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl md:rounded-2xl border border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 animate-scale-in animation-delay-1400">
                          <p className="text-[10px] md:text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Left Child</p>
                          <p className="font-extrabold text-white text-base md:text-lg mb-1 truncate">{binaryTree.leftChild.name}</p>
                          <p className="text-[10px] md:text-xs text-yellow-400 font-mono font-semibold truncate">{binaryTree.leftChild.userId}</p>
                        </div>
                      )}
                      {binaryTree.rightChild && (
                        <div className="group p-4 md:p-5 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 rounded-xl md:rounded-2xl border border-yellow-500/40 hover:border-yellow-500/60 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 animate-scale-in animation-delay-1500">
                          <p className="text-[10px] md:text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Right Child</p>
                          <p className="font-extrabold text-white text-base md:text-lg mb-1 truncate">{binaryTree.rightChild.name}</p>
                          <p className="text-[10px] md:text-xs text-yellow-400 font-mono font-semibold truncate">{binaryTree.rightChild.userId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Wallet Address Section */}
        <div className="mb-6 md:mb-10 animate-fade-in-up animation-delay-800">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl border border-yellow-500/30 p-4 md:p-8 animate-scale-in animation-delay-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-extrabold text-white flex items-center gap-2 md:gap-3">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">Payment Information</span>
                <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-transparent hidden sm:block"></div>
              </h2>
              {!walletAddress && (
                <button
                  onClick={() => {
                    setModalWalletAddress(''); // Reset modal input when opening modal
                    setShowWalletModal(true);
                  }}
                  className="px-6 md:px-8 py-2 md:py-3 text-xs md:text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg md:rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  Setup Payment Info
                </button>
              )}
            </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-gray-200 mb-3 md:mb-4">USDT TRC20 Wallet Address</h3>
                {walletAddress ? (
                  <div className="p-4 md:p-6 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 border-2 border-yellow-500/40 rounded-xl md:rounded-2xl shadow-lg shadow-yellow-500/10">
                    <p className="text-xs md:text-sm font-mono text-white break-all font-semibold">{walletAddress}</p>
                    <p className="text-[10px] md:text-xs text-yellow-400 mt-2 md:mt-3 flex items-center gap-2 font-semibold">
                      <span className="text-green-400 text-base md:text-lg">✓</span> Wallet address configured
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-400 mt-2">
                      Wallet address cannot be changed. Contact admin support if you need to update it.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 md:p-6 bg-gradient-to-br from-yellow-500/15 to-yellow-600/10 border-2 border-yellow-500/40 rounded-xl md:rounded-2xl">
                    <p className="text-sm md:text-base text-yellow-400 font-bold">No wallet address set</p>
                    <p className="text-xs md:text-sm text-yellow-300 mt-2 font-semibold">Required for withdrawals</p>
                    <p className="text-[10px] md:text-xs text-gray-400 mt-2 md:mt-3">
                      Supported: USDT TRC20 only
                    </p>
                  </div>
                )}
              </div>
            {!walletAddress && (
              <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-red-900/40 to-red-800/30 border-2 border-red-500/50 rounded-xl md:rounded-2xl shadow-lg shadow-red-500/10">
                <p className="text-sm md:text-base font-extrabold text-red-400 mb-2 flex items-center gap-2">
                  <span className="text-lg md:text-xl">⚠️</span> Payment Information Required
                </p>
                <p className="text-xs md:text-sm text-red-300">
                  You need to set a USDT TRC20 wallet address to request withdrawals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Address Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-4 md:top-10 mx-auto p-4 md:p-6 border border-yellow-500/30 w-full max-w-2xl shadow-2xl rounded-xl bg-gray-900">
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-white mb-2">Setup Payment Information</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Set your USDT TRC20 wallet address to enable withdrawals.
                </p>
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-sm font-medium text-yellow-400 mb-1">Payment Method:</p>
                  <p className="text-xs text-yellow-300">
                    Only <strong className="text-yellow-400">USDT TRC20</strong> wallet addresses are accepted for withdrawals.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* USDT TRC20 Wallet Address Section */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">USDT TRC20 Wallet Address</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Wallet Address {walletAddress && <span className="text-gray-500">(Cannot be changed)</span>}
                      </label>
                      {walletAddress ? (
                        <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
                          <p className="text-sm font-mono text-white break-all">{walletAddress}</p>
                          <p className="mt-2 text-xs text-red-400">
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
                            className="w-full px-4 py-3 border border-yellow-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-800 text-white font-mono text-sm"
                            placeholder="Enter your USDT TRC20 wallet address (starts with T)"
                            autoComplete="off"
                          />
                          <p className="mt-2 text-xs text-gray-400">
                            Enter your USDT TRC20 wallet address for withdrawals. This can only be set once.
                          </p>
                          <p className="mt-1 text-xs text-yellow-400 font-medium">
                            💡 USDT TRC20 wallet addresses start with "T" (e.g., Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx).
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWalletModal(false);
                      setModalWalletAddress(''); // Reset modal input on cancel
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!modalWalletAddress || modalWalletAddress.trim().length === 0) {
                        const errorMsg = 'Please enter a USDT TRC20 wallet address';
                        setError(errorMsg);
                        toast.error(errorMsg);
                        return;
                      }
                      
                      const trimmedAddress = modalWalletAddress.trim();
                      // Validate USDT TRC20 address format (should start with T)
                      if (!trimmedAddress.startsWith('T')) {
                        const errorMsg = 'Invalid USDT TRC20 address. USDT TRC20 addresses must start with "T".';
                        setError(errorMsg);
                        toast.error(errorMsg);
                        return;
                      }
                      
                      try {
                        await api.updateWalletAddress({ 
                          walletAddress: trimmedAddress
                        });
                        setShowWalletModal(false);
                        setModalWalletAddress(''); // Clear modal input after successful save
                        toast.success('Payment information updated successfully!');
                        await fetchDashboardData();
                      } catch (err: any) {
                        const errorMsg = err.message || 'Failed to update payment information';
                        setError(errorMsg);
                        toast.error(errorMsg);
                      }
                    }}
                    disabled={!modalWalletAddress || modalWalletAddress.trim().length === 0}
                    className="px-8 py-3 text-sm font-bold text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
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

