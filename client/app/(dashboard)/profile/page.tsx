'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [referralLinks, setReferralLinks] = useState<{ leftLink: string; rightLink: string; userId: string } | null>(null);
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
    fetchReferralLinks();
  }, []);

  const fetchReferralLinks = async () => {
    try {
      const response = await api.getUserReferralLinks();
      if (response.data) {
        setReferralLinks(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch referral links:', err);
      // Don't show error toast - referral links are optional
    }
  };

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
    return <BigBullLoader fullScreen />;
  }

  return (
    <div className="w-full min-h-screen py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
        <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">My Profile</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Manage your account information and settings</p>
      </div>

      <div className="bg-gradient-to-br from-[#08152F]/95 via-[#0C1A6B]/90 to-[#05627C]/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/30 p-8">
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
                  Full Name <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-[#08152F]/80 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-yellow-400 mb-3">
                  Email Address
                </label>
                <div className="p-4 bg-[#08152F]/80 border border-yellow-400/30 rounded-xl">
                  <p className="text-sm text-white font-semibold">{formData.email}</p>
                  <p className="text-xs text-yellow-400 mt-2 font-semibold">
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
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-[#08152F]/80 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-bold text-yellow-400 mb-3">
                  Country <span className="text-yellow-300">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-yellow-500/40 rounded-xl bg-[#08152F]/80 text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 font-semibold"
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
                <div className="p-4 bg-[#08152F]/80 border border-yellow-400/30 rounded-xl">
                  <p className="text-sm font-mono text-yellow-400 break-all font-extrabold">{formData.userId || user?.userId || 'N/A'}</p>
                  <p className="text-xs text-yellow-400 mt-2 font-semibold">
                    Your unique user identifier
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Links Section */}
            {referralLinks && (
              <div className="mt-6">
                <label className="block text-sm font-bold text-yellow-400 mb-4">
                  Referral Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group relative p-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent rounded-2xl border-2 border-yellow-500/40 hover:border-yellow-500/70 hover:shadow-yellow-500/30 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-yellow-400 mb-4 flex items-center gap-3 text-lg">
                        <span className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50"></span>
                        Left Referral Link
                      </h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={referralLinks.leftLink}
                          readOnly
                          className="flex-1 px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-900/80 text-white text-sm focus:outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/30 font-mono backdrop-blur-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Try modern clipboard API first
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(referralLinks.leftLink);
                                toast.success('Left referral link copied!');
                              } else {
                                // Fallback for older browsers or non-secure contexts
                                const textArea = document.createElement('textarea');
                                textArea.value = referralLinks.leftLink;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                textArea.style.top = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  const successful = document.execCommand('copy');
                                  if (successful) {
                                    toast.success('Left referral link copied!');
                                  } else {
                                    throw new Error('Copy command failed');
                                  }
                                } catch (err) {
                                  toast.error('Failed to copy link. Please copy manually.');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            } catch (err) {
                              console.error('Failed to copy:', err);
                              toast.error('Failed to copy link. Please copy manually.');
                            }
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 text-sm font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="group relative p-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent rounded-2xl border-2 border-yellow-500/40 hover:border-yellow-500/70 hover:shadow-yellow-500/30 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-300"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-yellow-400 mb-4 flex items-center gap-3 text-lg">
                        <span className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/50"></span>
                        Right Referral Link
                      </h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={referralLinks.rightLink}
                          readOnly
                          className="flex-1 px-4 py-3 border border-yellow-500/40 rounded-xl bg-gray-900/80 text-white text-sm focus:outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/30 font-mono backdrop-blur-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Try modern clipboard API first
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(referralLinks.rightLink);
                                toast.success('Right referral link copied!');
                              } else {
                                // Fallback for older browsers or non-secure contexts
                                const textArea = document.createElement('textarea');
                                textArea.value = referralLinks.rightLink;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                textArea.style.top = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  const successful = document.execCommand('copy');
                                  if (successful) {
                                    toast.success('Right referral link copied!');
                                  } else {
                                    throw new Error('Copy command failed');
                                  }
                                } catch (err) {
                                  toast.error('Failed to copy link. Please copy manually.');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            } catch (err) {
                              console.error('Failed to copy:', err);
                              toast.error('Failed to copy link. Please copy manually.');
                            }
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 text-sm font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              <div className="p-4 bg-[#08152F]/80 border border-yellow-400/30 rounded-xl">
                {formData.walletAddress ? (
                  <>
                    <p className="text-sm font-mono text-white break-all font-semibold">{formData.walletAddress}</p>
                    <p className="text-xs text-yellow-400 mt-2 font-semibold">
                      Wallet address cannot be changed. Contact admin support if you need to update it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-yellow-400 font-semibold">No wallet address set</p>
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
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

