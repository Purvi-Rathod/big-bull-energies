'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
}

const WALLET_TYPES = [
  { value: 'investment', label: 'Investment' },
  { value: 'roi', label: 'ROI' },
  { value: 'referral', label: 'Referral' },
  { value: 'binary', label: 'Binary' },
  { value: 'career_level', label: 'Career Level' },
  { value: 'interest', label: 'Interest' },
  { value: 'fixed', label: 'Fixed (admin-only, no withdraw, no ROI)' },
];

export default function AddFundsPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    walletType: 'investment',
    amount: '',
    description: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminUsers({ page: 1, limit: 1000 });
      if (response.data) {
        setUsers(response.data.users || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!userSearch.trim()) {
      toast.error('Please enter a user ID, name, or email');
      return;
    }

    setSearching(true);
    try {
      const response = await api.getAdminUsers({ page: 1, limit: 100, search: userSearch });
      if (response.data?.users && response.data.users.length > 0) {
        const users = response.data.users;
        setUsers(users);
        if (users.length === 1) {
          setSelectedUser(users[0]);
          setFormData(prev => ({ ...prev, userId: users[0].id }));
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

    if (!formData.userId || !formData.walletType || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    setAdding(true);
    try {
      const response = await api.addFundsToWallet({
        userId: formData.userId,
        walletType: formData.walletType,
        amount,
        description: formData.description || undefined,
      });

      if (response.data) {
        toast.success(`Successfully added $${amount.toFixed(2)} to ${response.data.userName}'s ${formData.walletType} wallet. New balance: $${response.data.newBalance.toFixed(2)}`);
      } else {
        toast.success(`Successfully added $${amount.toFixed(2)} to ${formData.walletType} wallet`);
      }
      
      // Reset form
      setFormData({
        userId: '',
        walletType: 'investment',
        amount: '',
        description: '',
      });
      setSelectedUser(null);
      setUserSearch('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add funds');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Add Funds to Wallet</h1>
        <p className="mt-1 text-sm text-black">Add funds to any user's wallet</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Search User
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by User ID, Name, or Email..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* User Selection */}
          {users.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Select User
              </label>
              <select
                value={formData.userId}
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value);
                  setSelectedUser(user || null);
                  setFormData(prev => ({ ...prev, userId: e.target.value }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.userId} - {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
              <p className="text-sm font-medium text-indigo-900">Selected User:</p>
              <p className="text-sm text-indigo-700">ID: {selectedUser.userId}</p>
              <p className="text-sm text-indigo-700">Name: {selectedUser.name}</p>
              <p className="text-sm text-indigo-700">Email: {selectedUser.email}</p>
            </div>
          )}

          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Wallet Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.walletType}
              onChange={(e) => setFormData(prev => ({ ...prev, walletType: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {WALLET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Amount (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description for this transaction..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adding || !formData.userId || !formData.amount}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding Funds...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
