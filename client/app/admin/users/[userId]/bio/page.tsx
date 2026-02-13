'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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
  voucherId?: string | null;
  voucher?: {
    voucherId: string;
    amount: number;
  } | null;
}

interface BinaryTreeInfo {
  parent: {
    id: string;
    userId: string;
    name: string;
  } | null;
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
  cappingLimit: number;
}

interface UserBio {
  user: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    status: string;
    walletAddress: string | null;
    bankAccount: any;
    referrer: {
      userId: string;
      name: string;
      email: string | null;
    } | null;
    position: string | null;
    createdAt: string;
  };
  wallets: Wallet[];
  investments: Investment[];
  binaryTree: BinaryTreeInfo | null;
  vouchers: Array<{
    id: string;
    voucherId: string;
    amount: number;
    status: string;
    createdAt: string;
    expiresAt?: string;
  }>;
  directReferrals: Array<{
    userId: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    status: string;
    joinedAt: string;
  }>;
}

export default function UserBioPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [bio, setBio] = useState<UserBio | null>(null);
  const [reports, setReports] = useState<{
    withdrawals: any[];
    referralTransactions: any[];
    roiTransactions: any[];
    binaryTransactions: any[];
    allTransactions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserBio();
      fetchUserReports();
    }
  }, [userId]);

  const fetchUserBio = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getUserBio(userId);
      if (response.data) {
        setBio(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user bio');
      toast.error(err.message || 'Failed to fetch user bio');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    try {
      const response = await api.getAdminUserReports(userId);
      if (response.data) {
        setReports(response.data);
      } else {
        setReports({ withdrawals: [], referralTransactions: [], roiTransactions: [], binaryTransactions: [], allTransactions: [] });
      }
    } catch (err) {
      console.error('Failed to fetch user reports:', err);
      setReports({ withdrawals: [], referralTransactions: [], roiTransactions: [], binaryTransactions: [], allTransactions: [] });
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
      fixed: 'Fixed (non-withdrawable)',
    };
    return names[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'suspended':
      case 'blocked':
        return 'bg-red-200 text-red-900 border-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading user bio...</p>
        </div>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

  const totalInvestment = bio.investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalWallets = bio.wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            User Bio: {bio.user.name}
          </h1>
          <p className="mt-1 text-gray-600">User ID: {bio.user.userId}</p>
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to User Management
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">User Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-base font-medium text-black">{bio.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-base font-medium text-black">{bio.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-base font-medium text-black">{bio.user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Country</p>
            <p className="text-base font-medium text-black">{bio.user.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 ${getStatusColor(bio.user.status)}`}>
              {bio.user.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="text-base font-medium text-black">{bio.user.position || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joined</p>
            <p className="text-base font-medium text-black">{formatDate(bio.user.createdAt)}</p>
          </div>
          {bio.user.referrer && (
            <div>
              <p className="text-sm text-gray-600">Sponsor</p>
              <p className="text-base font-medium text-black">{bio.user.referrer.name} ({bio.user.referrer.userId})</p>
            </div>
          )}
          {bio.user.walletAddress && (
            <div>
              <p className="text-sm text-gray-600">Wallet Address</p>
              <p className="text-xs font-mono text-black break-all">{bio.user.walletAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Investment</p>
          <p className="text-2xl font-bold mt-1">${totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Wallets</p>
          <p className="text-2xl font-bold mt-1">${totalWallets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Investments</p>
          <p className="text-2xl font-bold mt-1">{bio.investments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Direct Referrals</p>
          <p className="text-2xl font-bold mt-1">{bio.directReferrals.length}</p>
        </div>
      </div>

      {/* Wallets */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">Wallets</h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reserved</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Available</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bio.wallets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No wallets found</td>
                </tr>
              ) : (
                bio.wallets.map((wallet, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-black">{getWalletDisplayName(wallet.type)}</td>
                    <td className="px-4 py-3 text-sm text-black">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-black">${wallet.reserved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-black">${(wallet.balance - wallet.reserved).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investments Report */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">Investments Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Package</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bio.investments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No investments found</td>
                </tr>
              ) : (
                bio.investments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-black">
                      {investment.package?.name || '-'}
                      {investment.voucher && (
                        <span className="ml-2 text-xs text-indigo-600">(Voucher: ${investment.voucher.amount})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">${investment.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-black">{investment.type}</td>
                    <td className="px-4 py-3 text-sm text-black">{formatDate(investment.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-black">{investment.expiresOn ? formatDate(investment.expiresOn) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Binary Tree */}
      {bio.binaryTree && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-4">Binary Tree</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Left Business</p>
              <p className="text-2xl font-bold text-black">${bio.binaryTree.leftBusiness.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">Left Downlines: {bio.binaryTree.leftDownlines}</p>
              <p className="text-sm text-gray-500">Left Carry: ${bio.binaryTree.leftCarry.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {bio.binaryTree.leftChild && (
                <p className="text-sm text-gray-600 mt-2">Left Child: {bio.binaryTree.leftChild.name} ({bio.binaryTree.leftChild.userId})</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Right Business</p>
              <p className="text-2xl font-bold text-black">${bio.binaryTree.rightBusiness.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-1">Right Downlines: {bio.binaryTree.rightDownlines}</p>
              <p className="text-sm text-gray-500">Right Carry: ${bio.binaryTree.rightCarry.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {bio.binaryTree.rightChild && (
                <p className="text-sm text-gray-600 mt-2">Right Child: {bio.binaryTree.rightChild.name} ({bio.binaryTree.rightChild.userId})</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Capping Limit</p>
            <p className="text-lg font-semibold text-black">${bio.binaryTree.cappingLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Vouchers */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">Vouchers</h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Voucher ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bio.vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No vouchers found</td>
                </tr>
              ) : (
                bio.vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-black">{voucher.voucherId}</td>
                    <td className="px-4 py-3 text-sm text-black">${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(voucher.status)}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{formatDate(voucher.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-black">{voucher.expiresAt ? formatDate(voucher.expiresAt) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Referrals */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4">Direct Referrals</h2>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bio.directReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No direct referrals found</td>
                </tr>
              ) : (
                bio.directReferrals.map((referral) => (
                  <tr key={referral.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-black">{referral.userId}</td>
                    <td className="px-4 py-3 text-sm text-black">{referral.name}</td>
                    <td className="px-4 py-3 text-sm text-black">{referral.email}</td>
                    <td className="px-4 py-3 text-sm text-black">{referral.country}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{formatDate(referral.joinedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports section - Withdrawals, Referral, ROI, Binary, All Transactions */}
      {reports && (
        <div className="space-y-6">
          {/* Withdrawals Report */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Withdrawals Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Charges</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Final Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Wallet Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.withdrawals.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-500">No withdrawals found</td></tr>
                  ) : (
                    reports.withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-black">${w.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${w.charges?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black font-medium">${w.finalAmount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">{w.walletType}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(w.status)}`}>{w.status}</span></td>
                        <td className="px-4 py-3 text-sm text-black">{w.method || '—'}</td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(w.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Referral Report */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Referral Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.referralTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-500">No referral transactions found</td></tr>
                  ) : (
                    reports.referralTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-black">{tx.type}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceBefore?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceAfter?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">{tx.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[120px]" title={tx.txRef}>{tx.txRef || '—'}</td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Report */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">ROI Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.roiTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-500">No ROI transactions found</td></tr>
                  ) : (
                    reports.roiTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-black">{tx.type}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceBefore?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceAfter?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">{tx.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[120px]" title={tx.txRef}>{tx.txRef || '—'}</td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Binary Report */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Binary Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.binaryTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-500">No binary transactions found</td></tr>
                  ) : (
                    reports.binaryTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-black">{tx.type}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceBefore?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceAfter?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">{tx.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[120px]" title={tx.txRef}>{tx.txRef || '—'}</td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Transactions */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">All Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Wallet Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.allTransactions.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-4 text-center text-gray-500">No transactions found</td></tr>
                  ) : (
                    reports.allTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-black">{tx.walletType}</td>
                        <td className="px-4 py-3 text-sm font-medium text-black">{tx.type}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceBefore?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">${tx.balanceAfter?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-black">{tx.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[120px]" title={tx.txRef}>{tx.txRef || '—'}</td>
                        <td className="px-4 py-3 text-sm text-black">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
