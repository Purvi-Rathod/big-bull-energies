'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import toast from 'react-hot-toast';
import BigBullLoader from '@/components/BigBullLoader';
import { dashboardTheme as t } from '@/lib/dashboardTheme';

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
  const [walletDraft, setWalletDraft] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
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
        setWalletDraft('');
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

  const handleSaveWallet = async () => {
    const address = walletDraft.trim();
    if (!address) {
      toast.error('Please enter a USDT TRC20 wallet address');
      return;
    }
    if (address.length < 20) {
      toast.error('Wallet address seems too short. Please enter a valid USDT TRC20 address.');
      return;
    }
    if (!address.startsWith('T')) {
      toast.error('Invalid USDT TRC20 address. Addresses must start with "T".');
      return;
    }

    setSavingWallet(true);
    try {
      await api.updateWalletAddress({ walletAddress: address });
      setFormData((prev) => ({ ...prev, walletAddress: address }));
      setWalletDraft('');
      toast.success('Crypto wallet saved successfully');
      await refreshAuth();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save wallet address');
    } finally {
      setSavingWallet(false);
    }
  };

  if (loading) {
    return <BigBullLoader text="Loading profile…" />;
  }

  return (
    <div className={t.page}>
      <div>
        <h1 className={t.title}>My Profile</h1>
        <p className={t.subtitle}>Manage your account information and settings</p>
      </div>

      <div className={t.card}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
              <span className={t.accentBar} style={t.accentBarStyle} />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={t.label}>
                  Full Name <span style={{ color: t.gold }}>*</span>
                </label>
                <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className={t.input} />
              </div>
              <div>
                <label htmlFor="email" className={t.label}>Email Address</label>
                <div className={t.cardInner}>
                  <p className="text-sm font-semibold" style={{ color: t.ink }}>{formData.email}</p>
                  <p className="text-xs mt-2 font-medium" style={{ color: t.muted }}>
                    Email address cannot be changed. Contact admin support if you need to update it.
                  </p>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className={t.label}>Phone Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={t.input} />
              </div>
              <div>
                <label htmlFor="country" className={t.label}>
                  Country <span style={{ color: t.gold }}>*</span>
                </label>
                <select id="country" name="country" required value={formData.country} onChange={handleChange} className={t.select}>
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className={`${t.sectionTitle} mb-6 flex items-center gap-2`}>
              <span className={t.accentBar} style={t.accentBarStyle} />
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={t.label}>User ID</label>
                <div className={t.cardInner}>
                  <p className="text-sm font-mono font-extrabold break-all" style={{ color: t.primary }}>{formData.userId || user?.userId || 'N/A'}</p>
                  <p className="text-xs mt-2 font-medium" style={{ color: t.muted }}>Your unique user identifier</p>
                </div>
              </div>
            </div>

            {referralLinks && (
              <div className="mt-6">
                <label className={t.label}>Referral Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Left Referral Link', link: referralLinks.leftLink, toastMsg: 'Left referral link copied!' },
                    { label: 'Right Referral Link', link: referralLinks.rightLink, toastMsg: 'Right referral link copied!' },
                  ].map((item) => (
                    <div key={item.label} className={t.cardHighlight}>
                      <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: t.primary }}>{item.label}</h3>
                      <div className="flex items-center gap-2">
                        <input type="text" value={item.link} readOnly className={`${t.input} flex-1 font-mono text-sm`} />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (navigator.clipboard && window.isSecureContext) {
                                await navigator.clipboard.writeText(item.link);
                                toast.success(item.toastMsg);
                              } else {
                                const textArea = document.createElement('textarea');
                                textArea.value = item.link;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-999999px';
                                document.body.appendChild(textArea);
                                textArea.focus();
                                textArea.select();
                                try {
                                  if (document.execCommand('copy')) toast.success(item.toastMsg);
                                  else throw new Error('Copy failed');
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            } catch {
                              toast.error('Failed to copy link. Please copy manually.');
                            }
                          }}
                          className={t.btnPrimary}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div id="crypto-wallet">
            <h2 className={`${t.sectionTitle} mb-2 flex items-center gap-2`}>
              <span className={t.accentBar} style={t.accentBarStyle} />
              Crypto Wallet Setup
            </h2>
            <p className={`${t.subtitle} mb-6`}>
              USDT TRC20 address used for withdrawals. Set once — contact support to change later.
            </p>
            <div>
              <label className={t.label}>USDT TRC20 Wallet Address</label>
              {formData.walletAddress ? (
                <div className={t.cardInner}>
                  <p className="text-sm font-mono break-all font-semibold" style={{ color: t.ink }}>{formData.walletAddress}</p>
                  <p className="text-xs text-emerald-700 mt-2 font-semibold">✓ Wallet configured for withdrawals</p>
                  <p className="text-xs mt-2 font-medium" style={{ color: t.muted }}>
                    Wallet address cannot be changed here. Contact admin support if you need an update.
                  </p>
                </div>
              ) : (
                <div className={`${t.cardHighlight} space-y-3`}>
                  <p className="text-sm font-medium" style={{ color: t.muted }}>
                    Required before you can request withdrawals. Only USDT TRC20 (starts with T).
                  </p>
                  <input
                    type="text"
                    value={walletDraft}
                    onChange={(e) => setWalletDraft(e.target.value)}
                    placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`${t.input} font-mono text-sm`}
                  />
                  <button type="button" onClick={handleSaveWallet} disabled={savingWallet} className={t.btnPrimary}>
                    {savingWallet ? 'Saving…' : 'Save wallet address'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[#d8e6ec]">
            <button type="submit" disabled={saving} className={t.btnPrimary}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

