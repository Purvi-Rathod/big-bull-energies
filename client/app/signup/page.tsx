'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import Image from 'next/image';
import Link from 'next/link';
import CneoLoader from '@/components/CneoLoader';

function SignupContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    referrerId: '',
    position: 'left' as 'left' | 'right',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referrerFromUrl, setReferrerFromUrl] = useState(false);
  const [referrerValidation, setReferrerValidation] = useState<{
    checking: boolean;
    valid: boolean | null;
    message: string;
  }>({ checking: false, valid: null, message: '' });
  const { signup, user, admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateReferrerId = async (referrerId: string) => {
    if (!referrerId || referrerId.trim() === '') {
      setReferrerValidation({ checking: false, valid: null, message: '' });
      return;
    }

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    setReferrerValidation({ checking: true, valid: null, message: '' });

    // Debounce validation - wait 500ms after user stops typing
    validationTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.validateReferrer(referrerId.trim());
        if (response.data) {
          setReferrerValidation({
            checking: false,
            valid: response.data.valid,
            message: response.data.message,
          });
        }
      } catch (err: any) {
        setReferrerValidation({
          checking: false,
          valid: false,
          message: err.message || 'Failed to validate referrer ID',
        });
      }
    }, 500);
  };

  // Read referral parameters from URL
  useEffect(() => {
    const referrer = searchParams.get('referrer');
    const position = searchParams.get('position');
    
    if (referrer) {
      setFormData(prev => ({
        ...prev,
        referrerId: referrer,
        position: (position === 'right' ? 'right' : 'left') as 'left' | 'right',
      }));
      setReferrerFromUrl(true);
      // Validate referrer from URL
      validateReferrerId(referrer);
    }

    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [searchParams]);

  // Redirect after successful signup - auto-login user
  useEffect(() => {
    if (!authLoading) {
      if (admin) {
        // Admin account signup
        router.replace('/admin/dashboard');
      } else if (user) {
        // Regular user signup - redirect to dashboard
        if (user.userId === 'CNEOX-000000' || user.userId === 'CROWN-000000') {
          // CNEOX-000000 or CROWN-000000 user should be redirected to admin dashboard
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, admin, router, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate referrer ID in real-time if it's the referrerId field
    if (name === 'referrerId' && !referrerFromUrl) {
      validateReferrerId(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!isAdmin && !formData.email && !formData.phone) {
      setError('Either email or phone number is required');
      return;
    }

    setLoading(true);

    try {
      const signupData: any = {
        name: formData.name,
        password: formData.password,
      };

      if (isAdmin) {
        signupData.email = formData.email;
        if (formData.phone) signupData.phone = formData.phone;
      } else {
        if (formData.email) signupData.email = formData.email;
        if (formData.phone) signupData.phone = formData.phone;
        if (formData.country) signupData.country = formData.country;
        if (formData.referrerId) signupData.referrerId = formData.referrerId;
        if (formData.position) signupData.position = formData.position;
      }

      await signup(signupData, isAdmin);
      // User is now logged in automatically after signup
      // The useEffect hook will handle redirecting to dashboard
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/signinbg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Content - Made wider for better appearance */}
      <div className="relative z-10 max-w-2xl w-full space-y-8 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-500/30">
        <div>
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/logo1.png"
                alt="CNEOX Logo"
                width={180}
                height={60}
                className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>
          <h2 className="text-center text-3xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Create your account
            </span>
          </h2>
          {referrerFromUrl && (
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 border-2 border-yellow-500/40 rounded-xl">
              <p className="text-sm font-bold text-yellow-300 text-center">
                ✓ You're signing up with a referral link! Referrer and position have been automatically set.
              </p>
            </div>
          )}
          <p className="mt-2 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
              Sign in to existing account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/30 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              <p className="font-bold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-bold text-yellow-400 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {isAdmin ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-yellow-400 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-yellow-400 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-yellow-400 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-yellow-400 mb-2">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-bold text-yellow-400 mb-2">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    className="appearance-none block w-full px-4 py-3 border-2 border-yellow-500/40 bg-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 sm:text-sm text-white font-semibold transition-all"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name} className="bg-gray-800">
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="referrerId" className="block text-sm font-bold text-yellow-400 mb-2">
                    Referrer ID {referrerFromUrl && <span className="text-yellow-300">(From Link)</span>}
                  </label>
                  <input
                    id="referrerId"
                    name="referrerId"
                    type="text"
                    disabled={referrerFromUrl}
                    className={`appearance-none relative block w-full px-4 py-3 border-2 placeholder-gray-500 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 transition-all sm:text-sm font-semibold ${
                      referrerFromUrl 
                        ? 'bg-gray-700/50 cursor-not-allowed border-yellow-500/30 text-gray-400' 
                        : referrerValidation.valid === true
                        ? 'border-yellow-500/60 text-white focus:ring-yellow-500/50 focus:border-yellow-500/70'
                        : referrerValidation.valid === false
                        ? 'border-red-500/50 text-white focus:ring-red-500/50 focus:border-red-500/70'
                        : 'border-yellow-500/40 text-white focus:ring-yellow-500/50 focus:border-yellow-500/70'
                    }`}
                    placeholder="CNEOX-XXXXXX"
                    value={formData.referrerId}
                    onChange={handleChange}
                  />
                  {referrerFromUrl && (
                    <p className="mt-1 text-xs font-bold text-yellow-300">
                      Referrer ID was automatically filled from your referral link
                    </p>
                  )}
                  {!referrerFromUrl && formData.referrerId && (
                    <div className="mt-1">
                      {referrerValidation.checking ? (
                        <p className="text-xs text-gray-400 flex items-center font-semibold">
                          <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Validating referrer ID...
                        </p>
                      ) : referrerValidation.valid === true ? (
                        <p className="text-xs font-bold text-yellow-400 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {referrerValidation.message}
                        </p>
                      ) : referrerValidation.valid === false ? (
                        <p className="text-xs font-bold text-red-400 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {referrerValidation.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-bold text-yellow-400 mb-2">
                    Position {referrerFromUrl && <span className="text-yellow-300">(From Link)</span>}
                  </label>
                  <select
                    id="position"
                    name="position"
                    disabled={referrerFromUrl}
                    className={`appearance-none block w-full px-4 py-3 border-2 bg-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 sm:text-sm text-white font-semibold transition-all ${
                      referrerFromUrl ? 'bg-gray-700/50 cursor-not-allowed border-yellow-500/30' : 'border-yellow-500/40 focus:ring-yellow-500/50 focus:border-yellow-500/70'
                    }`}
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="left" className="bg-gray-800">Left</option>
                    <option value="right" className="bg-gray-800">Right</option>
                  </select>
                  {referrerFromUrl && (
                    <p className="mt-1 text-xs font-bold text-yellow-300">
                      Position was automatically set from your referral link
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-yellow-400 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                  placeholder="Enter password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-yellow-400 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center">
            <input
              id="is-admin"
              name="is-admin"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label htmlFor="is-admin" className="ml-2 block text-sm font-medium text-black cursor-pointer">
              Sign up as Admin
            </label>
          </div> */}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<CneoLoader fullScreen />}>
      <SignupContent />
    </Suspense>
  );
}

