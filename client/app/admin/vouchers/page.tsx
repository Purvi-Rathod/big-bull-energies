'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import AdminUserSearchInput, { getEffectiveUserSearch } from '@/components/AdminUserSearchInput';

interface Voucher {
  id: string;
  voucherId: string;
  user: {
    id: string;
    userId: string;
    name: string;
    email: string;
  } | null;
  amount: number;
  investmentValue: number;
  multiplier: number;
  status: string;
  createdOn: string;
  createdAt: string;
  usedAt: string | null;
  expiry: string | null;
  fromWalletType: string | null;
  createdBy: {
    name: string;
    userId: string;
  } | null;
}

export default function AdminVouchersPage() {
  const { user, admin, loading: authLoading } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUseCrownPrefix, setSearchUseCrownPrefix] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [formUserId, setFormUserId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formExpiryDays, setFormExpiryDays] = useState('120');
  const [minVoucherAmount, setMinVoucherAmount] = useState<number>(12.5); // Default fallback

  useEffect(() => {
    if (user || admin) {
      fetchVouchers();
      fetchMinimumVoucherAmount();
    }
  }, [user, admin, startDate, endDate]);

  // Also fetch minimum when modal opens to ensure latest value
  useEffect(() => {
    if (showCreateModal) {
      fetchMinimumVoucherAmount();
    }
  }, [showCreateModal]);

  const fetchMinimumVoucherAmount = async () => {
    try {
      // Admin can use the same endpoint or calculate from packages
      // For now, let's use packages API since admin might not have access to user endpoint
      const response = await api.getPackages({ status: 'Active' });
      if (response.data?.packages && response.data.packages.length > 0) {
        // Find minimum investment amount from all active packages
        const minAmounts = response.data.packages.map((pkg: any) => {
          const minAmount = typeof pkg.minAmount === 'object' && (pkg.minAmount as any).$numberDecimal
            ? parseFloat((pkg.minAmount as any).$numberDecimal)
            : typeof pkg.minAmount === 'number'
            ? pkg.minAmount
            : parseFloat(String(pkg.minAmount));
          return minAmount;
        });
        const minInvestment = Math.min(...minAmounts);
        // Minimum voucher is half of minimum investment
        const minVoucher = minInvestment / 2;
        setMinVoucherAmount(minVoucher);
      }
    } catch (err: any) {
      console.error('Failed to load packages for minimum voucher calculation:', err);
      // Keep default fallback value
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getAllVouchers({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response.data) {
        setVouchers(response.data.vouchers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vouchers');
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async () => {
    const idPart = formUserId.trim().toUpperCase().replace(/^CROWN-/, '');
    if (!idPart || !formAmount) {
      setError('User ID and amount are required');
      return;
    }
    const fullUserId = `CROWN-${idPart}`;

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (amount < minVoucherAmount) {
      setError(`Minimum voucher amount is $${minVoucherAmount.toFixed(2)}. You cannot create a voucher below this amount.`);
      return;
    }

    const expiryDays = parseInt(formExpiryDays) || 120;
    if (expiryDays <= 0) {
      setError('Expiry days must be a positive number');
      return;
    }

    try {
      setCreating(true);
      setError('');
      await api.createVoucherForUser({
        userId: fullUserId,
        amount,
        expiryDays,
      });
      
      // Reset form
      setFormUserId('');
      setFormAmount('');
      setFormExpiryDays('120');
      setShowCreateModal(false);
      
      // Refresh vouchers list
      await fetchVouchers();
      
      alert('Voucher created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to create voucher');
      console.error('Error creating voucher:', err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 font-bold shadow-sm';
      case 'used':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300 font-bold shadow-sm';
      case 'expired':
      case 'rejected':
        return 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-2 border-red-400 font-bold shadow-sm';
      case 'revoked':
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300 font-bold shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300 font-semibold shadow-sm';
    }
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const effectiveSearch = getEffectiveUserSearch(searchTerm, searchUseCrownPrefix);

  // Filter vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = 
      voucher.voucherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voucher.user?.userId && voucher.user.userId.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      voucher.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'expired' && isExpired(voucher.expiry)) ||
      (statusFilter !== 'expired' && voucher.status === statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Voucher Management</h1>
          <p className="mt-1 text-sm text-black">Track and manage all vouchers in the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Voucher
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Search
            </label>
            <AdminUserSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              useCrownPrefix={searchUseCrownPrefix}
              onUseCrownPrefixChange={setSearchUseCrownPrefix}
              placeholderWithoutPrefix="Voucher ID, name, email..."
            />
          </div>
          <div>
            <label className="block text-sm text-black font-medium text-black mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-4 items-end flex-wrap pt-4 border-t border-gray-200">
          <label className="text-sm font-medium text-black whitespace-nowrap">Date Range:</label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-black">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-sm"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px]">
                  Voucher ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px]">
                  User
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px]">
                  Amount
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[120px]">
                  Investment Value
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[90px]">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px]">
                  Created At
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px]">
                  Expiry Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px]">
                  Duration
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[140px]">
                  Used At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-black">
                    No vouchers found
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => {
                  const createdDate = new Date(voucher.createdAt);
                  const expiryDate = voucher.expiry ? new Date(voucher.expiry) : null;
                  const durationDays = expiryDate 
                    ? Math.ceil((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  return (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="text-xs font-mono text-black truncate max-w-[140px]" title={voucher.voucherId}>{voucher.voucherId}</div>
                      </td>
                      <td className="px-3 py-3">
                        {voucher.user ? (
                          <div>
                            <div className="text-xs font-medium text-black truncate max-w-[140px]" title={voucher.user.name}>{voucher.user.name}</div>
                            <div className="text-xs text-black truncate max-w-[140px]" title={voucher.user.userId}>{voucher.user.userId}</div>
                            <div className="text-xs text-black truncate max-w-[140px]" title={voucher.user.email}>{voucher.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-black">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs font-medium text-black">
                          ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs font-medium text-green-600">
                          ${voucher.investmentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-black">({voucher.multiplier}x)</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 shadow-sm ${getStatusColor(voucher.status)}`}>
                          {voucher.status}
                          {isExpired(voucher.expiry) && voucher.status === 'active' && ' (Expired)'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-black">{formatDate(voucher.createdAt)}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-black">{formatDate(voucher.expiry)}</div>
                        {isExpired(voucher.expiry) && (
                          <span className="text-xs text-red-600">(Expired)</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-black">
                          {durationDays !== null ? `${durationDays} days` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-black">{formatDate(voucher.usedAt)}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-black mb-4">Create Voucher</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  User ID *
                </label>
                <div className="flex items-center w-full rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="inline-flex items-center pl-3 py-2 text-gray-600 font-mono border-r border-gray-300 bg-gray-50 rounded-l-md text-sm">CROWN-</span>
                  <input
                    type="text"
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value.toUpperCase().replace(/^CROWN-/, ''))}
                    placeholder="e.g. 000001"
                    className="flex-1 min-w-0 px-3 py-2 border-0 rounded-r-md focus:outline-none focus:ring-0 text-black placeholder:text-gray-500 font-mono"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Amount (USD) *
                </label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  min={minVoucherAmount}
                  step="0.01"
                  placeholder={minVoucherAmount.toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-black">
                  Minimum voucher amount: ${minVoucherAmount.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-black">
                  Investment Value will be: ${(parseFloat(formAmount) || 0) * 2} (2x multiplier)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  Expiry Days (default: 120)
                </label>
                <input
                  type="number"
                  value={formExpiryDays}
                  onChange={(e) => setFormExpiryDays(e.target.value)}
                  min="1"
                  placeholder="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormUserId('');
                    setFormAmount('');
                    setFormExpiryDays('120');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVoucher}
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Voucher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

