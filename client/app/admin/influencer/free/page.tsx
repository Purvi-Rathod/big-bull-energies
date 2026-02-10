'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Package {
  id: string;
  packageName: string;
  minAmount: number;
  maxAmount: number;
  roi?: number;
  duration: number;
  status: string;
}

export default function FreeAccountPage() {
  const { admin } = useAuth();
  const [userId, setUserId] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [amount, setAmount] = useState('');
  const [binaryTarget, setBinaryTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [freeAccounts, setFreeAccounts] = useState<Array<{
    userId: string;
    name: string;
    email: string;
    country: string;
    influencerUserId: string;
    influencerName: string;
    binaryTargetAmount: number;
    targetStatus: string;
    withdrawEnabled: boolean;
    packageName: string;
    amount: number;
    createdAt: string;
  }>>([]);
  const [loadingFreeAccounts, setLoadingFreeAccounts] = useState(false);
  const hasFetchedPackages = useRef(false);

  useEffect(() => {
    if (hasFetchedPackages.current) return;
    hasFetchedPackages.current = true;
    fetchPackages();
    fetchFreeAccounts();
  }, []);

  const fetchFreeAccounts = async () => {
    try {
      setLoadingFreeAccounts(true);
      const res = await api.getFreeAccountsList();
      if (res.data?.accounts) setFreeAccounts(res.data.accounts);
    } catch (err) {
      setFreeAccounts([]);
    } finally {
      setLoadingFreeAccounts(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.getPackages({ limit: 500 });
      if (res.data?.packages) {
        const raw = res.data.packages;
        const list = (Array.isArray(raw) ? raw : []).map((p: any) => ({
          id: p._id?.toString() || p.id?.toString() || '',
          packageName: p.packageName || 'Unnamed',
          minAmount: typeof p.minAmount === 'object' && p.minAmount?.$numberDecimal != null
            ? parseFloat(p.minAmount.$numberDecimal)
            : typeof p.minAmount === 'number' ? p.minAmount : parseFloat(p.minAmount) || 0,
          maxAmount: typeof p.maxAmount === 'object' && p.maxAmount?.$numberDecimal != null
            ? parseFloat(p.maxAmount.$numberDecimal)
            : typeof p.maxAmount === 'number' ? p.maxAmount : parseFloat(p.maxAmount) || 0,
          roi: p.roi,
          duration: p.duration || 0,
          status: p.status || 'Active',
        })).filter((p: Package) => p.id && p.status?.toLowerCase() === 'active');
        setPackages(list);
      }
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const amountNum = amount ? parseFloat(amount) : NaN;
  const targetNum = binaryTarget ? parseFloat(binaryTarget) : NaN;
  const amountValid = selectedPackage && !isNaN(amountNum) && amountNum >= selectedPackage.minAmount && amountNum <= selectedPackage.maxAmount;
  const targetValid = !isNaN(targetNum) && targetNum >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      toast.error('Please enter an existing User ID');
      return;
    }
    if (!selectedPackageId || !selectedPackage) {
      toast.error('Please select a package');
      return;
    }
    if (!amountValid) {
      toast.error(`Enter a valid amount between $${selectedPackage.minAmount} and $${selectedPackage.maxAmount}`);
      return;
    }
    if (!targetValid) {
      toast.error('Enter a valid binary target (non-negative number)');
      return;
    }

    try {
      setCreating(true);
      await api.createFreeAccounts({
        userId: trimmedUserId,
        packageId: selectedPackageId,
        amount: amountNum,
        binaryTargetAmount: targetNum,
      });
      toast.success(`Package and target applied to ${trimmedUserId}. No new account created.`);
      setUserId('');
      setSelectedPackageId('');
      setAmount('');
      setBinaryTarget('');
      await fetchFreeAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to activate free account');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Create Free Account
        </h1>
        <p className="mt-2 text-base text-gray-700">
          Enter an existing user ID. That user will receive the package investment and binary target. No new account or downline is created.
        </p>
      </div>

      {/* Free Account Rules */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Free Account Rules (Official)</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-2">
              <ul className="list-disc list-inside space-y-0.5">
                <li>On free activation: <strong>no referral income</strong> for uplines; funded amount <strong>does not count</strong> as binary tree business</li>
                <li>User earns <strong>ROI on the funded package</strong>; <strong>binary and referral income apply only to future paid investments</strong></li>
              </ul>
              <p className="font-medium mt-1">Before completing the binary target:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li><strong>ROI withdrawal: locked</strong></li>
                <li><strong>Referral + Binary: unlocked</strong> (can withdraw)</li>
                <li>Withdrawal limited to binary/referral income earned</li>
              </ul>
              <p className="font-medium mt-1">After completing the binary target:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Can withdraw from <strong>ROI wallet</strong></li>
                <li>All eligible incomes withdrawable as per system rules</li>
              </ul>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                <li>Existing referrer and downline structure <strong>remain unchanged</strong>; no new account or downline is created</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-8 space-y-6">
        {/* 1. Existing User ID */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Existing User ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. CROWN-00024"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500 font-mono"
          />
          <p className="mt-1 text-xs text-gray-600">The same account will receive the package and target. No new account is created.</p>
        </div>

        {/* 2. Package */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Package <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPackageId}
            onChange={(e) => {
              setSelectedPackageId(e.target.value);
              setAmount('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black bg-white"
          >
            <option value="">Select a package</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packageName} (${p.minAmount} – ${p.maxAmount})
              </option>
            ))}
          </select>
          {selectedPackage && (
            <p className="mt-1 text-xs text-gray-600">
              ROI: {selectedPackage.roi ?? 'N/A'}% · Duration: {selectedPackage.duration} days
            </p>
          )}
        </div>

        {/* 3. Package amount */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Package Amount (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={selectedPackage?.minAmount ?? 0}
            max={selectedPackage?.maxAmount ?? 999999}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={selectedPackage ? `e.g. ${selectedPackage.minAmount}` : 'Select package first'}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500"
          />
          {selectedPackage && (
            <p className="mt-1 text-xs text-gray-600">
              Min: ${selectedPackage.minAmount} · Max: ${selectedPackage.maxAmount}
            </p>
          )}
        </div>

        {/* 4. Binary target */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Binary Target (user must complete to unlock withdrawals) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={binaryTarget}
            onChange={(e) => setBinaryTarget(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            Binary target to unlock ROI withdrawals. Before completion, user can withdraw Binary and Referral only; after completion, all eligible wallets.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={
              creating ||
              !userId.trim() ||
              !selectedPackageId ||
              !amountValid ||
              !targetValid
            }
            className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-bold"
          >
            {creating ? 'Activating...' : 'Activate Free Account'}
          </button>
        </div>
      </form>

      {/* Created Free Accounts table - full width for broader display */}
      <div className="mt-10 w-full max-w-[1600px] mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Free Accounts</h2>
          <p className="text-sm text-gray-600 mt-0.5">Existing users who received a free investment and binary target (no new account created)</p>
        </div>
        {loadingFreeAccounts ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : freeAccounts.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">No free accounts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Referrer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Binary Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Target Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Withdraw</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {freeAccounts.map((row) => (
                  <tr key={row.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-black">{row.userId}</td>
                    <td className="px-4 py-3 text-sm text-black">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[180px]" title={row.email}>{row.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-black">{row.country || '—'}</td>
                    <td className="px-4 py-3 text-sm text-black">
                      <span className="font-mono">{row.influencerUserId || '—'}</span>
                      {row.influencerName ? <span className="text-gray-600"> — {row.influencerName}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{row.packageName}</td>
                    <td className="px-4 py-3 text-sm font-medium text-black">${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-black">${row.binaryTargetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.targetStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {row.targetStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.withdrawEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {row.withdrawEnabled ? 'Enabled' : 'Locked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
