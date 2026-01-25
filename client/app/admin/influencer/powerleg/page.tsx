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

export default function PowerlegAccountPage() {
  const { admin } = useAuth();
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.getPackages({ limit: 1000 });
      
      if (response.data?.packages) {
        const rawPackages = response.data.packages || [];
        
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
          
          // Handle Decimal128 object
          if (typeof value === 'object' && value.toString) {
            const num = parseFloat(value.toString());
            return isNaN(num) ? 0 : num;
          }
          
          // Handle direct number or string
          const num = typeof value === 'string' ? parseFloat(value) : value;
          return isNaN(num) ? 0 : num;
        };
        
        // Transform packages to match the expected format
        const formattedPackages = rawPackages
          .filter((pkg: any) => pkg._id || pkg.id)
          .map((pkg: any) => ({
            id: (pkg._id?.toString() || pkg.id?.toString() || '').toString(),
            packageName: pkg.packageName || pkg.name || 'Unknown Package',
            minAmount: extractDecimalValue(pkg.minAmount),
            maxAmount: extractDecimalValue(pkg.maxAmount),
            roi: pkg.roi || pkg.totalOutputPct || 0,
            duration: pkg.duration || 0,
            status: pkg.status || 'active',
          }));
        
        setPackages(formattedPackages);
        
        if (formattedPackages.length === 0) {
          toast.error('No packages found');
        }
      }
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      toast.error(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!userSearch.trim()) {
      toast.error('Please enter a User ID, name, or email');
      return;
    }

    setSearching(true);
    try {
      const response = await api.getAdminUsers({ page: 1, limit: 100, search: userSearch });
      if (response.data?.users && response.data.users.length > 0) {
        const foundUsers = response.data.users;
        setUsers(foundUsers);
        
        // Auto-select if only one user found
        if (foundUsers.length === 1) {
          setSelectedUser(foundUsers[0]);
          setUsers([]);
          setUserSearch('');
        }
      } else {
        toast.error('No users found');
        setUsers([]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    if (pkg) {
      const amount = parseFloat(investmentAmount);
      if (amount < pkg.minAmount || amount > pkg.maxAmount) {
        toast.error(`Amount must be between $${pkg.minAmount} and $${pkg.maxAmount}`);
        return;
      }
    }

    try {
      setCreating(true);
      const response = await api.createPowerlegInvestment({
        userId: selectedUser.userId,
        packageId: selectedPackage,
        amount: parseFloat(investmentAmount),
      });

      if (response.data) {
        toast.success(`Successfully created powerleg investment for ${selectedUser.userId}`);
        
        // Reset form
        setSelectedUser(null);
        setUserSearch('');
        setSelectedPackage('');
        setInvestmentAmount('');
        setUsers([]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create powerleg investment');
    } finally {
      setCreating(false);
    }
  };

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Create Powerleg Investment</h1>
        <p className="mt-2 text-base text-gray-700">
          Create powerleg investments for existing users - Binary income only, no ROI
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Powerleg Investment Rules</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>❌ No ROI eligibility - ROI is fully disabled only for this investment</li>
                <li>✅ Binary income only - upliners can earn binary rewards from this investment</li>
                <li>❌ No direct income, level income, or bonus rewards</li>
                <li>✅ Only binary rewards will be reflected in downlines for this investment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-8 space-y-6">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            User ID <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.userId) {
                  setSelectedUser(null);
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="Search by User ID, Name, or Email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {users.length > 0 && (
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto mb-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setUsers([]);
                    setUserSearch('');
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="font-medium text-black">{user.userId}</div>
                  <div className="text-sm text-black">{user.name} - {user.email}</div>
                </button>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium text-green-800">
                Selected: {selectedUser.userId} - {selectedUser.name}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setUserSearch('');
                }}
                className="mt-1 text-sm text-green-600 hover:text-green-800"
              >
                Change user
              </button>
            </div>
          )}
        </div>

        {/* Package Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Package <span className="text-red-500">*</span>
          </label>
          {packages.length === 0 ? (
            <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50 text-red-600">
              No packages available. Please create packages first.
            </div>
          ) : (
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            >
              <option value="">Select a package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.packageName} (${pkg.minAmount} - ${pkg.maxAmount})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Investment Amount (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
            required
          />
          {selectedPackage && (() => {
            const pkg = packages.find(p => p.id === selectedPackage);
            return pkg ? (
              <p className="mt-1 text-xs text-black">
                Range: ${pkg.minAmount} - ${pkg.maxAmount}
              </p>
            ) : null;
          })()}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={creating || !selectedUser || !selectedPackage || !investmentAmount || parseFloat(investmentAmount) <= 0}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-bold"
          >
            {creating ? 'Creating...' : 'Done'}
          </button>
        </div>
      </form>
    </div>
  );
}
