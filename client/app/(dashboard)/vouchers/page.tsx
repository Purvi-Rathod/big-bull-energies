'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';
import { Ticket } from 'lucide-react';

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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAmount, setCreateAmount] = useState('');
  const [fromWalletType, setFromWalletType] = useState('');
  const [creating, setCreating] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [minVoucherAmount, setMinVoucherAmount] = useState<number>(12.5);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchVouchers();
    fetchWallets();
    fetchMinimumVoucherAmount();
  }, []);

  useEffect(() => {
    if (showCreateModal) fetchMinimumVoucherAmount();
  }, [showCreateModal]);

  const fetchMinimumVoucherAmount = async () => {
    try {
      const response = await api.getMinimumVoucherAmount();
      if (response.data?.minimumVoucherAmount) {
        setMinVoucherAmount(response.data.minimumVoucherAmount);
      }
    } catch (err: any) {
      console.error('Failed to load minimum voucher amount:', err);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await api.getUserWallets();
      if (response.data) setWallets(response.data.wallets || []);
    } catch (err: any) {
      console.error('Failed to load wallets:', err);
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await api.getUserVouchers();
      if (response.data) setVouchers(response.data.vouchers || []);
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
      const errorMsg = `Minimum voucher amount is $${minVoucherAmount.toFixed(2)}.`;
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

    const selectedWallet = wallets.find((w) => w.type === fromWalletType);
    if (selectedWallet) {
      const availableBalance =
        parseFloat(selectedWallet.balance) -
        parseFloat(selectedWallet.reserved || '0');
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
    const diffTime = new Date(expiry).getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysSinceCreation = (createdAt: string) => {
    const diffTime = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <BigBullLoader text="Loading vouchers…" />;
  }

  return (
    <div className={t.page}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={t.title}>Vouchers</h1>
          <p className={t.subtitle}>
            Create and manage investment vouchers from your earning wallets
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className={t.btnPrimary}
        >
          + Create Voucher
        </button>
      </div>

      {error && <div className={t.error}>{error}</div>}

      {vouchers.length === 0 ? (
        <div className={t.cardEmpty}>
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: t.soft }}
          >
            <Ticket className="h-7 w-7" style={{ color: t.primary }} />
          </div>
          <p className="text-lg font-bold" style={{ color: t.ink }}>
            No vouchers found
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: t.muted }}>
            Create a voucher from ROI, referral, or binary earnings to reinvest.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={`${t.btnPrimary} mt-6`}
          >
            Create Your First Voucher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((voucher) => {
            const expired = isExpired(voucher.expiry);
            const daysRemaining = getDaysRemaining(voucher.expiry);
            const daysSinceCreation = getDaysSinceCreation(voucher.createdAt);
            const investmentValue =
              voucher.investmentValue ||
              voucher.amount * (voucher.multiplier || 2);

            return (
              <div key={voucher.id} className={t.card}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className="truncate font-mono text-sm font-extrabold"
                      style={{ color: t.primary }}
                    >
                      {voucher.voucherId}
                    </h3>
                    <p className="mt-1 text-xs font-medium" style={{ color: t.muted }}>
                      Created:{' '}
                      {new Date(
                        voucher.createdOn || voucher.createdAt,
                      ).toLocaleString()}
                    </p>
                    {daysSinceCreation !== null && (
                      <p className="text-xs font-medium" style={{ color: t.muted }}>
                        {daysSinceCreation} day
                        {daysSinceCreation !== 1 ? 's' : ''} ago
                      </p>
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      voucher.status === 'active' && !expired
                        ? t.badgeActive
                        : voucher.status === 'used'
                          ? t.badgeNeutral
                          : expired
                            ? t.badgeError
                            : t.badgeNeutral
                    }`}
                  >
                    {expired ? 'Expired' : voucher.status}
                  </span>
                </div>

                <div className={`${t.cardHighlight} mb-3`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold" style={{ color: t.ink }}>
                      Purchase Amount
                    </span>
                    <span className="text-xl font-extrabold" style={{ color: t.primary }}>
                      ${voucher.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: t.muted }}>
                      Investment Value
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: t.ink }}>
                      ${investmentValue.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold" style={{ color: t.muted }}>
                    Multiplier: {voucher.multiplier || 2}x
                  </p>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                  <div className={t.cardInner}>
                    <div className="mb-1 text-xs font-semibold" style={{ color: t.muted }}>
                      Created
                    </div>
                    <div className="font-bold" style={{ color: t.ink }}>
                      {new Date(
                        voucher.createdOn || voucher.createdAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  {voucher.expiry && (
                    <div
                      className={`rounded-xl border p-3 ${
                        expired
                          ? 'border-red-200 bg-red-50'
                          : 'border-[#d8e6ec] bg-[#F7FBFC]'
                      }`}
                    >
                      <div className="mb-1 text-xs font-semibold" style={{ color: t.muted }}>
                        Expiry
                      </div>
                      <div
                        className="font-bold"
                        style={{ color: expired ? '#b91c1c' : t.ink }}
                      >
                        {new Date(voucher.expiry).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                {voucher.expiry && daysRemaining !== null && (
                  <div
                    className={`mb-3 rounded-xl border-2 p-3 ${
                      expired
                        ? 'border-red-200 bg-red-50'
                        : daysRemaining <= 7
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-[#d8e6ec] bg-[#F7FBFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: t.ink }}>
                        Days remaining
                      </span>
                      <span className="font-extrabold" style={{ color: t.primary }}>
                        {expired
                          ? 'Expired'
                          : daysRemaining <= 0
                            ? '0'
                            : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    {!expired && daysRemaining > 0 && (
                      <div className="mt-3 h-2 w-full rounded-full bg-[#e8f0f3]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (daysRemaining / 120) * 100)}%`,
                            backgroundColor: t.gold,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {voucher.usedAt && (
                  <div className={`${t.cardInner} mb-2 text-sm`}>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>Used on</span>
                      <span className="font-bold" style={{ color: t.ink }}>
                        {new Date(voucher.usedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {voucher.fromWalletType && (
                  <div className={`${t.cardInner} text-sm`}>
                    <div className="flex justify-between">
                      <span style={{ color: t.muted }}>From</span>
                      <span className="font-bold capitalize" style={{ color: t.ink }}>
                        {voucher.fromWalletType} wallet
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className={t.modalOverlay}>
          <div className={t.modalPanel}>
            <h3 className="mb-1 text-xl font-extrabold" style={{ color: t.ink }}>
              Create Voucher
            </h3>
            <p className="mb-5 text-sm font-medium" style={{ color: t.muted }}>
              Convert wallet balance into an investment voucher
            </p>

            <div className="mb-4">
              <label className={t.label}>Amount (USD)</label>
              <input
                type="number"
                value={createAmount}
                onChange={(e) => setCreateAmount(e.target.value)}
                min={minVoucherAmount}
                step="0.01"
                className={t.input}
                placeholder={`Minimum $${minVoucherAmount.toFixed(2)}`}
              />
              <p className="mt-2 text-xs font-semibold" style={{ color: t.muted }}>
                Minimum:{' '}
                <span style={{ color: t.primary }}>
                  ${minVoucherAmount.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className={t.label}>From Wallet</label>
              <select
                value={fromWalletType}
                onChange={(e) => setFromWalletType(e.target.value)}
                required
                className={t.select}
              >
                <option value="">Select a wallet</option>
                {wallets
                  .filter((wallet) =>
                    ['roi', 'interest', 'referral', 'binary', 'career_level'].includes(
                      wallet.type,
                    ),
                  )
                  .map((wallet) => {
                    const walletNames: Record<string, string> = {
                      roi: 'ROI Wallet',
                      interest: 'Interest Wallet',
                      referral: 'Referral Wallet',
                      binary: 'Binary Wallet',
                      career_level: 'Career Level Wallet',
                    };
                    return (
                      <option key={wallet.type} value={wallet.type}>
                        {walletNames[wallet.type] || wallet.type} — $
                        {parseFloat(wallet.balance).toFixed(2)}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateAmount('');
                  setFromWalletType('');
                  setError('');
                }}
                className={t.btnGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateVoucher}
                disabled={creating}
                className={t.btnPrimary}
              >
                {creating ? 'Creating…' : 'Create Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
