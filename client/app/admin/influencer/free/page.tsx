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

interface AccountForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface FreeAccountData {
  influencerUserId: string;
  accounts: Array<{
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }>;
  binaryTargetAmount?: number;
}

export default function FreeAccountPage() {
  const { admin } = useAuth();
  const [influencerSearch, setInfluencerSearch] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<User | null>(null);
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [numAccounts, setNumAccounts] = useState(1);
  const [accounts, setAccounts] = useState<AccountForm[]>([
    { name: '', email: '', phone: '', password: '' }
  ]);
  const [binaryTargetAmount, setBinaryTargetAmount] = useState('');

  const searchInfluencers = async () => {
    if (!influencerSearch.trim()) {
      toast.error('Please enter a user ID or name to search');
      return;
    }

    try {
      setSearching(true);
      const response = await api.getAdminUsers({
        page: 1,
        limit: 20,
        search: influencerSearch,
      });

      if (response.data?.users) {
        const foundUsers = response.data.users;
        setInfluencers(foundUsers);
        
        // Auto-select if only one user found
        if (foundUsers.length === 1) {
          setSelectedInfluencer(foundUsers[0]);
          setInfluencers([]);
          setInfluencerSearch('');
          toast.success(`Selected influencer: ${foundUsers[0].userId}`);
        } else if (foundUsers.length === 0) {
          toast.error('No users found');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleNumAccountsChange = (value: number) => {
    if (value < 1) value = 1;
    if (value > 50) value = 50;
    setNumAccounts(value);
    
    // Update accounts array
    const newAccounts: AccountForm[] = [];
    for (let i = 0; i < value; i++) {
      newAccounts.push(accounts[i] || { name: '', email: '', phone: '', password: '' });
    }
    setAccounts(newAccounts);
  };

  const updateAccount = (index: number, field: keyof AccountForm, value: string) => {
    const newAccounts = [...accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setAccounts(newAccounts);
  };

  const generatePassword = (index: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateAccount(index, 'password', password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInfluencer) {
      toast.error('Please select an influencer');
      return;
    }

    // Validate accounts
    const invalidAccounts = accounts.filter(
      acc => !acc.name.trim() || !acc.password.trim() || acc.password.length < 8
    );
    if (invalidAccounts.length > 0) {
      toast.error('All accounts must have a name and password (min 8 characters)');
      return;
    }

    // Validate binary target if provided
    let targetAmount: number | undefined = undefined;
    if (binaryTargetAmount && binaryTargetAmount.trim()) {
      const parsed = parseFloat(binaryTargetAmount);
      if (isNaN(parsed) || parsed < 0) {
        toast.error('Binary target amount must be a valid positive number');
        return;
      }
      targetAmount = parsed;
    }

    try {
      setCreating(true);
      const response = await api.createFreeAccounts({
        influencerUserId: selectedInfluencer.userId,
        accounts: accounts.map(acc => ({
          name: acc.name.trim(),
          email: acc.email.trim() || undefined,
          phone: acc.phone.trim() || undefined,
          password: acc.password,
        })),
        binaryTargetAmount: targetAmount,
      });

      if (response.data) {
        toast.success(`Successfully created ${response.data.createdAccounts.length} free account(s)`);
        
        // Show created accounts
        if (response.data.createdAccounts.length > 0) {
          const accountsList = response.data.createdAccounts
            .map(acc => `${acc.userId} - ${acc.name}`)
            .join('\n');
          console.log('Created accounts:', accountsList);
        }

        // Show errors if any
        if (response.data.errors && response.data.errors.length > 0) {
          console.warn('Some accounts failed to create:', response.data.errors);
          toast.error(`${response.data.errors.length} account(s) failed to create. Check console for details.`);
        }

        // Reset form
        setAccounts([{ name: '', email: '', phone: '', password: '' }]);
        setNumAccounts(1);
        setBinaryTargetAmount('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create free accounts');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Create Free Accounts</h1>
        <p className="mt-2 text-base text-gray-700">
          Create free accounts that are activated immediately without requiring investment
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Free Account Rules</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>✅ Activated immediately - no investment required</li>
                <li>✅ Can earn all income types (ROI, Binary, Referral, etc.)</li>
                <li>✅ Can invest in packages normally</li>
                <li>⚠️ <strong>Withdrawal Restriction:</strong> Can only withdraw from Binary wallet</li>
                <li>⚠️ <strong>Target Required:</strong> Must complete binary target to unlock withdrawals</li>
                <li>⚠️ <strong>Withdrawal Limit:</strong> Can only withdraw amount earned from binary business (up to target)</li>
                <li>✅ Placed under selected influencer as downline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-8 space-y-6">
        {/* Influencer Selection */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Select Influencer <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={influencerSearch}
              onChange={(e) => {
                setInfluencerSearch(e.target.value);
                // Clear selection if user starts typing
                if (selectedInfluencer && e.target.value !== selectedInfluencer.userId) {
                  setSelectedInfluencer(null);
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchInfluencers())}
              placeholder="Search by User ID or Name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
            />
            <button
              type="button"
              onClick={searchInfluencers}
              disabled={searching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {influencers.length > 0 && (
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {influencers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedInfluencer(user);
                    setInfluencers([]);
                    setInfluencerSearch('');
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    selectedInfluencer?.id === user.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="font-medium">{user.userId}</div>
                  <div className="text-sm text-black">{user.name}</div>
                </button>
              ))}
            </div>
          )}

          {selectedInfluencer && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium text-green-800">
                Selected: {selectedInfluencer.userId} - {selectedInfluencer.name}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInfluencer(null);
                  setInfluencerSearch('');
                }}
                className="mt-1 text-sm text-green-600 hover:text-green-800"
              >
                Change influencer
              </button>
            </div>
          )}
        </div>

        {/* Number of Accounts */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Number of Accounts to Create <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={numAccounts}
            onChange={(e) => handleNumAccountsChange(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
          />
        </div>

        {/* Binary Target Amount (Optional) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Binary Target Amount (Optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={binaryTargetAmount}
            onChange={(e) => setBinaryTargetAmount(e.target.value)}
            placeholder="Enter target amount (e.g., 40000)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
          />
          <p className="mt-1 text-xs text-black">
            If set, free accounts must complete this binary business target before they can withdraw. They can only withdraw from binary wallet up to this amount.
          </p>
        </div>

        {/* Account Forms */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-black">
            Account Details <span className="text-red-500">*</span>
          </label>
          {accounts.map((account, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium text-black mb-2">Account {index + 1}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-black mb-1">Name *</label>
                  <input
                    type="text"
                    value={account.name}
                    onChange={(e) => updateAccount(index, 'name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={account.email}
                    onChange={(e) => updateAccount(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={account.phone}
                    onChange={(e) => updateAccount(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-black mb-1">Password * (min 8 chars)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={account.password}
                      onChange={(e) => updateAccount(index, 'password', e.target.value)}
                      required
                      minLength={8}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
                    />
                    <button
                      type="button"
                      onClick={() => generatePassword(index)}
                      className="px-3 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-xs"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={
              creating || 
              !selectedInfluencer || 
              accounts.some(acc => !acc.name.trim() || !acc.password.trim() || acc.password.length < 8)
            }
            className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-bold"
            title={
              !selectedInfluencer 
                ? 'Please select an influencer' 
                : accounts.some(acc => !acc.name.trim() || !acc.password.trim() || acc.password.length < 8)
                ? 'Please fill all required account fields'
                : creating
                ? 'Creating accounts...'
                : ''
            }
          >
            {creating ? 'Creating...' : `Create ${numAccounts} Free Account${numAccounts > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
