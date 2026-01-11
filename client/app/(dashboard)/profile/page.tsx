'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import toast from 'react-hot-toast';
import CrownLoader from '@/components/CrownLoader';

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    walletAddress: '',
    userId: '',
  });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getUserProfile();
      if (response.data?.user) {
        const userData = response.data.user;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || '',
          walletAddress: userData.walletAddress || '',
          userId: userData.userId || user?.userId || '',
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Remove walletAddress and email from update - they can only be changed by admin
      const { walletAddress, email, ...updateData } = formData;
      await api.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      await refreshAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CrownLoader fullScreen />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">My Profile</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account information and settings</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-500/30 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-yellow-400 mb-3">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-yellow-400 mb-3">
                  Email Address
                </label>
                <div className="p-4 bg-gray-800/80 border border-yellow-500/30 rounded-xl">
                  <p className="text-sm text-white font-semibold">{formData.email}</p>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">
                    Email address cannot be changed. Contact admin support if you need to update it.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-yellow-400 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-bold text-yellow-400 mb-3">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account Information - Read Only */}
          <div>
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-3">
                  User ID
                </label>
                <div className="p-4 bg-gray-800/80 border border-yellow-500/30 rounded-xl">
                  <p className="text-sm font-mono text-yellow-400 break-all font-extrabold">{formData.userId || user?.userId || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">
                    Your unique user identifier
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-3">
                  Referral Link
                </label>
                <div className="p-4 bg-gray-800/80 border border-yellow-500/30 rounded-xl">
                  <p className="text-sm font-mono text-white break-all font-semibold mb-2">
                    {typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${formData.userId || user?.userId || ''}` : 'Loading...'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const link = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${formData.userId || user?.userId || ''}` : '';
                      if (link) {
                        navigator.clipboard.writeText(link);
                        toast.success('Referral link copied to clipboard!');
                      }
                    }}
                    className="text-xs text-yellow-400 hover:text-yellow-300 font-bold underline transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information - Read Only */}
          <div>
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded"></span>
              Wallet Information
            </h2>
            <div>
              <label className="block text-sm font-bold text-yellow-400 mb-3">
                USDT TRC20 Wallet Address
              </label>
              <div className="p-4 bg-gray-800/80 border border-yellow-500/30 rounded-xl">
                {formData.walletAddress ? (
                  <>
                    <p className="text-sm font-mono text-white break-all font-semibold">{formData.walletAddress}</p>
                    <p className="text-xs text-gray-400 mt-2 font-semibold">
                      Wallet address cannot be changed. Contact admin support if you need to update it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 font-semibold">No wallet address set</p>
                    <p className="text-xs text-yellow-400 mt-2 font-semibold">
                      Required for withdrawals. Set up your wallet address in the Withdraw page.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-yellow-500/20">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
          </div>
        </div>
  );
}

