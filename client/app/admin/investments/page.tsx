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
  roi: number;
  duration: number;
  status: string;
}

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
}

interface AdminCreatedInvestment {
  transactionId: string;
  transactionName: string;
  userId: string;
  packageId: string;
  packageName: string;
  country: string;
  amount: number;
  createdAt: string;
}

export default function AdminInvestmentsPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    packageId: '',
    amount: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [adminCreatedList, setAdminCreatedList] = useState<AdminCreatedInvestment[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchData();
    fetchAdminCreatedInvestments();
  }, []);

  const fetchAdminCreatedInvestments = async (params?: { fromDate?: string; toDate?: string }) => {
    try {
      setLoadingReport(true);
      const res = await api.getAdminCreatedInvestments(params);
      if (res.data?.investments) {
        setAdminCreatedList(res.data.investments);
      }
    } catch (err) {
      console.error('Failed to load admin-created investments:', err);
      setAdminCreatedList([]);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleApplyDateFilter = () => {
    fetchAdminCreatedInvestments(
      fromDate || toDate ? { fromDate: fromDate || undefined, toDate: toDate || undefined } : undefined
    );
  };

  const handleClearDateFilter = () => {
    setFromDate('');
    setToDate('');
    fetchAdminCreatedInvestments();
  };

  const exportToExcel = () => {
    const headers = ['Transaction', 'User ID', 'Package ID', 'Country', 'Amount', 'Created Date'];
    const rows = adminCreatedList.map((row) => [
      row.transactionName,
      row.userId,
      row.packageId,
      row.country || '—',
      row.amount.toFixed(2),
      row.createdAt ? new Date(row.createdAt).toLocaleString() : '—',
    ]);
    const excelContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-created-investments_${new Date().toISOString().split('T')[0]}.xls`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, packagesRes] = await Promise.all([
        api.getAdminUsers({ page: 1, limit: 1000 }),
        api.getPackages({ limit: 1000 }),
      ]);
      
      console.log('Users response:', usersRes);
      console.log('Packages response:', packagesRes);
      
      if (usersRes.data) {
        setUsers(usersRes.data.users || []);
      }
      
      if (packagesRes.data) {
        const rawPackages = packagesRes.data.packages || [];
        
        // Helper function to extract value from MongoDB Decimal128 format
        const extractDecimalValue = (value: any): number => {
          if (value === null || value === undefined) {
            return 0;
          }
          
          // Handle MongoDB extended JSON format: { "$numberDecimal": "100" }
          if (typeof value === 'object' && value.$numberDecimal !== undefined) {
            const num = parseFloat(value.$numberDecimal);
            return isNaN(num) ? 0 : num;
          }
          
          // Handle Decimal128 objects with toString method
          if (typeof value === 'object' && typeof value.toString === 'function') {
            const num = parseFloat(value.toString());
            return isNaN(num) ? 0 : num;
          }
          
          // Handle plain numbers
          if (typeof value === 'number') {
            return isNaN(value) ? 0 : value;
          }
          
          // Handle strings
          if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
          }
          
          return 0;
        };
        
        const packagesList = rawPackages
          .filter((pkg: any) => pkg._id || pkg.id) // Filter out packages without IDs
          .map((pkg: any) => ({
            id: pkg._id?.toString() || pkg.id?.toString() || '',
            packageName: pkg.packageName || 'Unnamed Package',
            minAmount: extractDecimalValue(pkg.minAmount),
            maxAmount: extractDecimalValue(pkg.maxAmount),
            roi: pkg.roi || pkg.totalOutputPct || 0,
            duration: pkg.duration || 0,
            status: pkg.status || 'active',
          }));
        
        setPackages(packagesList);
        
        if (packagesList.length === 0) {
          toast.error('No packages found. Please create packages first.');
        }
      } else {
        console.error('No data in packages response:', packagesRes);
        toast.error('Failed to load packages. Please check the console for details.');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.packageId || !formData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const selectedPackage = packages.find(p => p.id === formData.packageId);
    if (selectedPackage) {
      if (amount < selectedPackage.minAmount || amount > selectedPackage.maxAmount) {
        toast.error(`Amount must be between $${selectedPackage.minAmount} and $${selectedPackage.maxAmount}`);
        return;
      }
    }

    setCreating(true);
    try {
      await api.adminCreateInvestment({
        userId: formData.userId,
        packageId: formData.packageId,
        amount,
        type: 'admin',
      });
      toast.success('Investment created successfully!');
      setFormData({ userId: '', packageId: '', amount: '' });
      setUserSearch('');
      await fetchAdminCreatedInvestments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create investment');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.userId.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Show searching indicator when user is typing
  useEffect(() => {
    if (userSearch.trim()) {
      setSearching(true);
      const timer = setTimeout(() => {
        setSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearching(false);
    }
  }, [userSearch]);

  const selectedPackage = packages.find(p => p.id === formData.packageId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Create Investment for User</h1>
        <p className="mt-1 text-sm text-black">Create investments on behalf of users</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <label htmlFor="userSearch" className="block text-sm font-medium text-black mb-2">
              Search User <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="userSearch"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  if (!e.target.value) {
                    setFormData({ ...formData, userId: '' });
                  }
                }}
                placeholder="Search by User ID, Name, or Email"
                className="w-full px-4 py-2 pr-10 border text-black border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searching && userSearch && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
            {userSearch && !searching && filteredUsers.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, userId: user.id });
                      setUserSearch(`${user.userId} - ${user.name}`);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-black">{user.userId}</div>
                    <div className="text-sm text-black">{user.name} {user.email && `(${user.email})`}</div>
                  </button>
                ))}
              </div>
            )}
            {userSearch && !searching && filteredUsers.length === 0 && (
              <p className="mt-1 text-sm text-black">No users found matching your search</p>
            )}
            {formData.userId && (
              <p className="mt-1 text-sm text-green-600">✓ User selected</p>
            )}
          </div>

          {/* Package Selection */}
          <div>
            <label htmlFor="packageId" className="block text-sm font-medium text-black mb-2">
              Package <span className="text-red-500">*</span>
            </label>
            <select
              id="packageId"
              required
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value, amount: '' })}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a package</option>
              {packages.length === 0 ? (
                <option disabled>No packages available</option>
              ) : (
                packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.packageName} (${pkg.minAmount} - ${pkg.maxAmount})
                  </option>
                ))
              )}
            </select>
            {packages.length === 0 && !loading && (
              <p className="mt-1 text-sm text-red-600">No packages found. Please create packages in the Packages section.</p>
            )}
            {selectedPackage && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-black">
                  <strong>ROI:</strong> {selectedPackage.roi}% | <strong>Duration:</strong> {selectedPackage.duration} days
                </p>
                <p className="text-sm text-black mt-1">
                  <strong>Amount Range:</strong> ${selectedPackage.minAmount} - ${selectedPackage.maxAmount}
                </p>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-black mb-2">
              Investment Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              required
              min={selectedPackage?.minAmount || 0}
              max={selectedPackage?.maxAmount || 999999}
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter investment amount"
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {selectedPackage && formData.amount && (
              <p className="mt-1 text-sm text-black">
                Must be between ${selectedPackage.minAmount} and ${selectedPackage.maxAmount}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={creating || !formData.userId || !formData.packageId || !formData.amount}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Investment'}
            </button>
          </div>
        </form>
      </div>

      {/* Report: Admin-created investments */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-black mb-4">Admin-Created Investments Report</h2>
        <p className="text-sm text-black mb-4">Investments created by admin on behalf of users</p>

        {/* Date filters and Excel export */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-black">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-black">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>
          <button
            type="button"
            onClick={handleApplyDateFilter}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClearDateFilter}
            className="px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            disabled={adminCreatedList.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Excel
          </button>
        </div>

        {loadingReport ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : adminCreatedList.length === 0 ? (
          <p className="text-black py-6 text-center">No admin-created investments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Package ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminCreatedList.map((row) => (
                  <tr key={row.transactionId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-black font-medium" title={row.transactionId}>{row.transactionName}</td>
                    <td className="px-4 py-3 text-sm text-black font-medium">{row.userId}</td>
                    <td className="px-4 py-3 text-sm text-black font-mono" title={row.packageName}>{row.packageId}</td>
                    <td className="px-4 py-3 text-sm text-black">{row.country || '—'}</td>
                    <td className="px-4 py-3 text-sm text-black font-semibold">${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-black">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</td>
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

