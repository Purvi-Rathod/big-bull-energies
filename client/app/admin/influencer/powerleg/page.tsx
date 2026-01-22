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

interface AccountForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function PowerlegAccountPage() {
  const { admin } = useAuth();
  const [influencerSearch, setInfluencerSearch] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<User | null>(null);
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [numAccounts, setNumAccounts] = useState(1);
  const [accounts, setAccounts] = useState<AccountForm[]>([
    { name: '', email: '', phone: '', password: '' }
  ]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [createInvestment, setCreateInvestment] = useState(false);
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
      console.log('Packages API response:', response);
      
      if (response.data?.packages) {
        const rawPackages = response.data.packages || [];
        console.log('Raw packages:', rawPackages);
        
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
        // Filter out packages without IDs (same as investments page)
        const formattedPackages = rawPackages
          .filter((pkg: any) => pkg._id || pkg.id) // Only filter by ID, not status
          .map((pkg: any) => ({
            id: (pkg._id?.toString() || pkg.id?.toString() || '').toString(),
            packageName: pkg.packageName || pkg.name || 'Unknown Package',
            minAmount: extractDecimalValue(pkg.minAmount),
            maxAmount: extractDecimalValue(pkg.maxAmount),
            roi: pkg.roi || pkg.totalOutputPct || 0,
            duration: pkg.duration || 0,
            status: pkg.status || 'active',
          }));
        
        console.log('Formatted packages:', formattedPackages);
        setPackages(formattedPackages);
        
        if (formattedPackages.length === 0) {
          toast.error('No packages found');
        }
      } else {
        console.warn('No packages in response:', response);
        toast.error('No packages data received from server');
      }
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      toast.error(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

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

    // Validate investment if enabled
    if (createInvestment) {
      if (!selectedPackage) {
        toast.error('Please select a package');
        return;
      }
      if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
        toast.error('Please enter a valid investment amount');
        return;
      }
      const pkg = packages.find(p => p.id === selectedPackage);
      if (pkg && parseFloat(investmentAmount) < pkg.minAmount) {
        toast.error(`Amount must be at least $${pkg.minAmount}`);
        return;
      }
    }

    try {
      setCreating(true);
      const response = await api.createPowerlegAccounts({
        influencerUserId: selectedInfluencer.userId,
        accounts: accounts.map(acc => ({
          name: acc.name.trim(),
          email: acc.email.trim() || undefined,
          phone: acc.phone.trim() || undefined,
          password: acc.password,
        })),
        packageId: createInvestment ? selectedPackage : undefined,
        amount: createInvestment ? parseFloat(investmentAmount) : undefined,
      });

      if (response.data) {
        toast.success(`Successfully created ${response.data.createdAccounts.length} powerleg account(s)`);
        
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
        }

        // Reset form
        setAccounts([{ name: '', email: '', phone: '', password: '' }]);
        setNumAccounts(1);
        setSelectedPackage('');
        setInvestmentAmount('');
        setCreateInvestment(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create powerleg accounts');
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Create Powerleg Accounts</h1>
        <p className="mt-2 text-base text-gray-700">
          Create special influencer downline accounts with restricted benefits (Binary income only, no ROI)
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
            <h3 className="text-sm font-medium text-yellow-800">Powerleg Account Rules</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>❌ No ROI eligibility - ROI is fully disabled</li>
                <li>✅ Binary income only - can earn binary rewards</li>
                <li>❌ No direct income, level income, or bonus rewards</li>
                <li>✅ Can invest in packages normally</li>
                <li>❌ Cannot withdraw ROI (no ROI earned)</li>
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
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-black">
              Debug: selectedInfluencer = {selectedInfluencer ? `${selectedInfluencer.userId} (${selectedInfluencer.name})` : 'null'}
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

        {/* Optional Investment */}
        <div className="border-t pt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={createInvestment}
              onChange={(e) => setCreateInvestment(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-black">Activate package investment for all accounts</span>
          </label>

          {createInvestment && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Package</label>
                {loading ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-black">
                    Loading packages...
                  </div>
                ) : packages.length === 0 ? (
                  <div className="w-full px-4 py-2 border border-red-300 rounded-md bg-red-50 text-red-600">
                    No packages available. Please create packages first.
                  </div>
                ) : (
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.packageName} (${pkg.minAmount} - ${pkg.maxAmount})
                      </option>
                    ))}
                  </select>
                )}
                {packages.length > 0 && (
                  <p className="mt-1 text-xs text-black">
                    {packages.length} package{packages.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Investment Amount</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder:text-black"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={creating || !selectedInfluencer || accounts.some(acc => !acc.name.trim() || !acc.password.trim() || acc.password.length < 8) || (createInvestment && (!selectedPackage || !investmentAmount || parseFloat(investmentAmount) <= 0))}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-bold"
            title={
              !selectedInfluencer 
                ? 'Please select an influencer' 
                : accounts.some(acc => !acc.name.trim() || !acc.password.trim() || acc.password.length < 8)
                ? 'Please fill all required account fields'
                : createInvestment && (!selectedPackage || !investmentAmount || parseFloat(investmentAmount) <= 0)
                ? 'Please select package and enter investment amount'
                : creating
                ? 'Creating accounts...'
                : ''
            }
          >
            {creating ? 'Creating...' : `Create ${numAccounts} Powerleg Account${numAccounts > 1 ? 's' : ''}`}
          </button>
        </div>
        

      </form>
    </div>
  );
}
