'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { formatDate } from '@/lib/utils';
import {
  Wallet,
  Wind,
  TrendingUp,
  Users,
  Network,
  Copy,
  ArrowRight,
  Package,
  Shield,
  Zap,
} from 'lucide-react';

interface WalletBalance {
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
  parent: { id: string; userId: string; name: string } | null;
  treeParent?: { id: string; userId: string; name: string } | null;
  leftChild: { id: string; userId: string; name: string } | null;
  rightChild: { id: string; userId: string; name: string } | null;
  leftBusiness: number;
  rightBusiness: number;
  leftCarry: number;
  rightCarry: number;
  leftDownlines: number;
  rightDownlines: number;
}

const PRIMARY = '#05627C';
const ACCENT = '#3FA9C8';
const GOLD = '#F5CF0B';
const INK = '#0B1F2A';
const MUTED = '#5A6F78';
const BINARY_RATE = 0.12;

const WALLET_ORDER = [
  'roi',
  'referral',
  'binary',
  'career_level',
  'interest',
  'token',
  'investment',
  'withdrawal',
  'main',
  'fixed',
];

const WALLET_META: Record<
  string,
  { label: string; accent: string; chip: string }
> = {
  roi: { label: 'Daily ROI', accent: '#0A7A96', chip: '#D6F0F7' },
  referral: { label: 'Referral Income', accent: '#05627C', chip: '#FFF3B0' },
  binary: { label: 'Binary', accent: '#B8860B', chip: '#FFF3B0' },
  career_level: { label: 'Career', accent: '#5B4BA8', chip: '#EDE7FF' },
  interest: { label: 'Interest', accent: '#1F7A6E', chip: '#D8F3EE' },
  token: { label: 'Token', accent: '#0A7A96', chip: '#D6F0F7' },
  investment: { label: 'Investment', accent: '#05627C', chip: '#DCEEE8' },
  withdrawal: { label: 'Withdrawal', accent: '#C45C1A', chip: '#FFE6D6' },
  main: { label: 'Main Wallet', accent: '#05627C', chip: '#DCEEE8' },
  fixed: { label: 'Fixed', accent: '#4A5C66', chip: '#E8EEF1' },
};

async function copyText(text: string, successMsg: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
      return;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success(successMsg);
  } catch {
    toast.error('Failed to copy. Please copy manually.');
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [binaryTree, setBinaryTree] = useState<BinaryTreeInfo | null>(null);
  const [referralLinks, setReferralLinks] = useState<{
    leftLink: string;
    rightLink: string;
    userId: string;
  } | null>(null);
  const [hasWalletAddress, setHasWalletAddress] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [directReferrals, setDirectReferrals] = useState<any[]>([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        walletsRes,
        investmentsRes,
        binaryTreeRes,
        referralLinksRes,
        userProfileRes,
        directReferralsRes,
      ] = await Promise.all([
        api.getUserWallets(),
        api.getUserInvestments(),
        api.getUserBinaryTree().catch(() => ({ data: null })),
        api.getUserReferralLinks().catch(() => ({ data: null })),
        api.getUserProfile().catch(() => ({ data: null })),
        api.getUserDirectReferrals().catch(() => ({ data: { referrals: [], count: 0 } })),
      ]);

      if (walletsRes.data) setWallets(walletsRes.data.wallets);
      if (investmentsRes.data) setInvestments(investmentsRes.data.investments);
      if (binaryTreeRes.data) setBinaryTree(binaryTreeRes.data.binaryTree);
      if (referralLinksRes.data) setReferralLinks(referralLinksRes.data);
      if (userProfileRes.data?.user) {
        setHasWalletAddress(Boolean(userProfileRes.data.user.walletAddress));
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

  const sortedWallets = [...wallets].sort((a, b) => {
    const ia = WALLET_ORDER.indexOf(a.type);
    const ib = WALLET_ORDER.indexOf(b.type);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const referralWallet = wallets.find((w) => w.type === 'referral');
  const otherWallets = sortedWallets.filter((w) => w.type !== 'referral');

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const activeInvestments = investments.filter((i) => i.isBinaryUpdated).length;
  const totalInvested = investments.reduce((sum, i) => sum + (i.investedAmount || 0), 0);
  const teamSize =
    (binaryTree?.leftDownlines || 0) + (binaryTree?.rightDownlines || 0);
  const matchedBusiness = binaryTree
    ? Math.min(binaryTree.leftBusiness, binaryTree.rightBusiness)
    : 0;
  const estimatedBinary = matchedBusiness * BINARY_RATE;

  if (loading) {
    return <BigBullLoader text="Loading your dashboard…" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl px-5 py-6 shadow-sm md:px-8 md:py-8"
        style={{
          background: `linear-gradient(125deg, ${PRIMARY} 0%, #0A7A96 55%, ${ACCENT} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute -right-6 top-0 opacity-20">
          <Wind className="h-40 w-40 text-white" />
        </div>
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl min-w-0">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
              <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: GOLD }} />
              Wind-powered portfolio
            </p>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl">
              Hello, {user?.name?.split(' ')[0] || 'Investor'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
              Monitor ROI streams, binary growth, and referrals in your Big Bull
              Energies member workspace.
            </p>
            {user?.userId && (
              <p className="mt-3 break-all font-mono text-xs font-semibold text-white/75">
                {user.userId}
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/plans"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-md transition hover:opacity-95 sm:w-auto"
              style={{ backgroundColor: GOLD, color: INK }}
            >
              <Package className="h-4 w-4" />
              Invest now
            </Link>
            <Link
              href="/binary"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
            >
              <Network className="h-4 w-4" />
              Binary
            </Link>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          {
            label: 'Total balance',
            value: `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            hint: 'All wallets combined',
          },
          {
            label: 'Active packages',
            value: String(activeInvestments),
            icon: TrendingUp,
            hint: `$${totalInvested.toLocaleString()} invested`,
          },
          {
            label: 'Team size',
            value: String(teamSize),
            icon: Users,
            hint: `${directReferrals.length} direct referrals`,
          },
          {
            label: 'Binary match',
            value: `$${matchedBusiness.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Network,
            hint: `${(BINARY_RATE * 100).toFixed(0)}% · $${estimatedBinary.toFixed(2)} est.`,
          },
        ].map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-2xl border border-white bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: MUTED }}
              >
                {label}
              </span>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#E8F5F0' }}
              >
                <Icon className="h-4 w-4" style={{ color: PRIMARY }} />
              </span>
            </div>
            <p className="break-words text-lg font-extrabold leading-tight sm:text-xl md:text-2xl" style={{ color: INK }}>
              {value}
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: MUTED }}>
              {hint}
            </p>
          </div>
        ))}
      </section>

      {!hasWalletAddress && (
        <div
          className="flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: 'rgba(245,207,11,0.55)',
            backgroundColor: '#FFF9E6',
          }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: PRIMARY }} />
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: INK }}>
                Add your USDT TRC20 wallet in Profile
              </p>
              <p className="text-xs font-medium" style={{ color: MUTED }}>
                Needed before withdrawals — managed under account settings.
              </p>
            </div>
          </div>
          <Link
            href="/profile#crypto-wallet"
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-extrabold sm:w-auto"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Open Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Wallets — high-contrast balances */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold md:text-xl" style={{ color: INK }}>
              Wallets & earnings
            </h2>
            <p className="text-xs font-medium" style={{ color: MUTED }}>
              Balances shown in high contrast for easy reading
            </p>
          </div>
          <Link
            href="/withdraw"
            className="text-xs font-bold hover:underline"
            style={{ color: PRIMARY }}
          >
            Withdraw →
          </Link>
        </div>

        {/* Featured Referral Income */}
        <div
          className="mb-4 overflow-hidden rounded-2xl border-2 bg-white shadow-md"
          style={{ borderColor: GOLD }}
        >
          <div
            className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 55%)' }}
          >
            <div className="min-w-0">
              <p
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider"
                style={{ backgroundColor: GOLD, color: INK }}
              >
                <Users className="h-3.5 w-3.5" />
                Referral Income
              </p>
              <p className="mt-2 text-sm font-medium" style={{ color: MUTED }}>
                Earnings from package activations in your network
              </p>
            </div>
            <div className="sm:text-right">
              <p
                className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl"
                style={{ color: INK }}
              >
                ${(referralWallet?.balance ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide" style={{ color: PRIMARY }}>
                {referralWallet?.currency || 'USD'} · available to withdraw
              </p>
              {(referralWallet?.reserved ?? 0) > 0 && (
                <p className="mt-1 text-xs font-semibold" style={{ color: MUTED }}>
                  Reserved ${(referralWallet?.reserved ?? 0).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {otherWallets.map((wallet) => {
            const meta = WALLET_META[wallet.type] || {
              label: wallet.type.replace(/_/g, ' '),
              accent: PRIMARY,
              chip: '#E8F5F0',
            };
            const hasBalance = wallet.balance > 0;
            return (
              <div
                key={wallet.type}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                style={{
                  borderColor: hasBalance ? meta.accent : '#d8e6ec',
                  borderWidth: hasBalance ? 2 : 1,
                }}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: meta.accent }} />
                <div className="px-3 py-4">
                  <p
                    className="inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
                    style={{ backgroundColor: meta.chip, color: INK }}
                  >
                    {meta.label}
                  </p>
                  <p
                    className="mt-2.5 text-xl font-black tracking-tight tabular-nums sm:text-2xl"
                    style={{ color: INK }}
                  >
                    ${wallet.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase" style={{ color: MUTED }}>
                    {wallet.currency || 'USD'}
                  </p>
                  {wallet.reserved > 0 && (
                    <p className="mt-1 text-[10px] font-semibold" style={{ color: MUTED }}>
                      Reserved ${wallet.reserved.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {sortedWallets.length === 0 && (
            <p
              className="col-span-full rounded-2xl border border-dashed border-[#c5d8e0] bg-white px-4 py-10 text-center text-sm font-medium"
              style={{ color: MUTED }}
            >
              No wallets found yet.
            </p>
          )}
        </div>
      </section>

      {/* Investments + Binary */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold md:text-xl" style={{ color: INK }}>
                Investments
              </h2>
              <p className="text-xs font-medium" style={{ color: MUTED }}>
                Packages powering your returns
              </p>
            </div>
            <Link
              href="/investments"
              className="text-xs font-bold hover:underline"
              style={{ color: PRIMARY }}
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#d8e6ec] bg-white shadow-sm">
            {investments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium" style={{ color: MUTED }}>
                  No investments yet.
                </p>
                <Link
                  href="/plans"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold"
                  style={{ color: PRIMARY }}
                >
                  Choose a package <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#e8f0f3]">
                {investments.slice(0, 6).map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold" style={{ color: INK }}>
                        {inv.package?.name || 'Package'}
                      </p>
                      <p className="text-xs font-medium" style={{ color: MUTED }}>
                        {formatDate(inv.createdAt)} · {inv.package?.roi ?? 0}% daily
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold" style={{ color: PRIMARY }}>
                        ${inv.investedAmount.toFixed(2)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          inv.isBinaryUpdated
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.isBinaryUpdated ? 'Active' : 'Processing'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold md:text-xl" style={{ color: INK }}>
              Binary legs
            </h2>
            <p className="text-xs font-medium" style={{ color: MUTED }}>
              Volume, carry & match
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-[#d8e6ec] bg-white p-4 shadow-sm sm:p-5">
            {binaryTree ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: '#E8F5F0' }}
                  >
                    <p
                      className="text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: PRIMARY }}
                    >
                      Left
                    </p>
                    <p className="mt-1 text-lg font-extrabold" style={{ color: INK }}>
                      ${binaryTree.leftBusiness.toFixed(2)}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold" style={{ color: MUTED }}>
                      Carry ${binaryTree.leftCarry.toFixed(2)}
                    </p>
                    <p className="text-[11px] font-semibold" style={{ color: MUTED }}>
                      {binaryTree.leftDownlines} downlines
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: '#E6F7FB' }}
                  >
                    <p
                      className="text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: ACCENT }}
                    >
                      Right
                    </p>
                    <p className="mt-1 text-lg font-extrabold" style={{ color: INK }}>
                      ${binaryTree.rightBusiness.toFixed(2)}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold" style={{ color: MUTED }}>
                      Carry ${binaryTree.rightCarry.toFixed(2)}
                    </p>
                    <p className="text-[11px] font-semibold" style={{ color: MUTED }}>
                      {binaryTree.rightDownlines} downlines
                    </p>
                  </div>
                </div>
                <div
                  className="rounded-xl border px-3 py-3"
                  style={{
                    borderColor: 'rgba(245,207,11,0.55)',
                    backgroundColor: '#FFF9E6',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: MUTED }}>
                      Matched · {(BINARY_RATE * 100).toFixed(0)}% binary
                    </span>
                    <span className="text-base font-extrabold" style={{ color: INK }}>
                      ${estimatedBinary.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/binary"
                  className="inline-flex items-center gap-1 text-xs font-extrabold hover:underline"
                  style={{ color: PRIMARY }}
                >
                  Full binary details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="py-8 text-center text-sm font-medium" style={{ color: MUTED }}>
                Binary tree data not available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Referral links */}
      {referralLinks && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-extrabold md:text-xl" style={{ color: INK }}>
              Referral links
            </h2>
            <p className="text-xs font-medium" style={{ color: MUTED }}>
              Invite partners to left or right placement
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(
              [
                { key: 'left', label: 'Left leg', href: referralLinks.leftLink },
                { key: 'right', label: 'Right leg', href: referralLinks.rightLink },
              ] as const
            ).map((link) => (
              <div
                key={link.key}
                className="rounded-2xl border border-[#d8e6ec] bg-white p-4 shadow-sm"
              >
                <p
                  className="mb-2 text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: PRIMARY }}
                >
                  {link.label}
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={link.href}
                    className="min-w-0 flex-1 truncate rounded-xl border border-[#d8e6ec] bg-[#F7FBFC] px-3 py-2 font-mono text-[11px] font-semibold"
                    style={{ color: INK }}
                  />
                  <button
                    type="button"
                    onClick={() => copyText(link.href, `${link.label} link copied`)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold"
                    style={{ backgroundColor: GOLD, color: INK }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Direct referrals */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold md:text-xl" style={{ color: INK }}>
              Direct referrals
            </h2>
            <p className="text-xs font-medium" style={{ color: MUTED }}>
              People you invited personally
            </p>
          </div>
          <Link
            href="/referrals"
            className="text-xs font-bold hover:underline"
            style={{ color: PRIMARY }}
          >
            Referrals →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#d8e6ec] bg-white shadow-sm">
          {directReferrals.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium" style={{ color: MUTED }}>
              No direct referrals yet. Share your links to grow your wind network.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr
                    className="border-b border-[#e8f0f3] text-[11px] font-extrabold uppercase tracking-wider"
                    style={{ color: MUTED, backgroundColor: '#F7FBFC' }}
                  >
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef4f7]">
                  {directReferrals.slice(0, 8).map((ref) => (
                    <tr key={ref.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold" style={{ color: INK }}>
                          {ref.name || '—'}
                        </p>
                        <p className="font-mono text-[11px] font-semibold" style={{ color: MUTED }}>
                          {ref.userId || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold capitalize" style={{ color: MUTED }}>
                        {ref.position || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>
                        {ref.joinedAt ? formatDate(ref.joinedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            ref.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
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
          )}
        </div>
      </section>
    </div>
  );
}
