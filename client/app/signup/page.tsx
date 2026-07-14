'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { countries } from '@/lib/countries';
import Image from 'next/image';
import Link from 'next/link';
import CrownLoader from '@/components/CrownLoader';

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
        if (user.userId === 'CROWN-000000' || user.userId === 'CROWN-000000') {
          // CROWN-000000 or CROWN-000000 user should be redirected to admin dashboard
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

  const inputCls =
    'underline-input w-full py-2.5 text-[#F6F5EC] placeholder-[#9FB8C9]/50 text-sm font-medium';
  const labelCls =
    'block text-xs font-semibold tracking-[0.15em] uppercase mb-2 text-[#9FB8C9]';

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_1.5fr] font-[var(--font-body)]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        :root {
          --font-display: 'Fraunces', serif;
          --font-body: 'Inter', sans-serif;
        }
        @keyframes drawLine {
          from {
            stroke-dashoffset: 900;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.4;
            r: 4;
          }
          50% {
            opacity: 1;
            r: 6;
          }
        }
        @keyframes shimmer {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(220%);
          }
        }
        .bull-line {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: drawLine 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
        }
        .bull-dot {
          animation: dotPulse 2.4s ease-in-out 2.3s infinite;
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.7s ease-out forwards;
        }
        .cta-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 100%
          );
          transform: translateX(-120%);
        }
        .cta-shimmer:hover::after {
          animation: shimmer 1s ease-in-out forwards;
        }
        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(159, 184, 201, 0.35);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .underline-input:focus {
          outline: none;
          border-bottom-color: #fbf676;
          box-shadow: 0 1px 0 0 #fbf676;
        }
        .underline-input:disabled {
          color: #9fb8c9;
          border-bottom-style: dashed;
          cursor: not-allowed;
        }
        .underline-select {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(159, 184, 201, 0.35);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          appearance: none;
          -webkit-appearance: none;
        }
        .underline-select:focus {
          outline: none;
          border-bottom-color: #fbf676;
          box-shadow: 0 1px 0 0 #fbf676;
        }
        .underline-select:disabled {
          color: #9fb8c9;
          border-bottom-style: dashed;
          cursor: not-allowed;
        }
        @media (prefers-reduced-motion: reduce) {
          .bull-line,
          .bull-dot,
          .fade-up,
          .cta-shimmer::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* Left — brand / signature panel */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden px-12 py-12"
        style={{
          background: 'linear-gradient(160deg, #081148 0%, #0C1A6B 50%, #05627C 130%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#FBF676 1px, transparent 1px), linear-gradient(90deg, #FBF676 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        ></div>

        <Link href="/" className="relative z-10 w-fit">
          <Image
            src="/image.png"
            alt="Crown Bankers Logo"
            width={168}
            height={56}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: '#FBF676' }}>
            New Member
          </p>
          <h1
            className="text-4xl lg:text-[2.6rem] leading-[1.1] mb-5 text-[#F6F5EC]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Take your position
            <br />
            before the market does.
          </h1>
          <p className="text-sm leading-relaxed text-[#9FB8C9] max-w-xs">
            Set up your account in minutes — portfolio tracking, referral
            network, and settlement all in one place.
          </p>

          <svg viewBox="0 0 420 160" className="mt-10 w-full max-w-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGlowSignup" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#05627C" />
                <stop offset="100%" stopColor="#FBF676" />
              </linearGradient>
            </defs>
            {[30, 70, 110, 150].map((y) => (
              <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="#F6F5EC" strokeOpacity="0.06" />
            ))}
            <path
              className="bull-line"
              d="M0 130 L60 118 L100 132 L150 90 L190 100 L240 55 L290 68 L340 30 L420 12"
              stroke="url(#lineGlowSignup)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle className="bull-dot" cx="420" cy="12" r="4" fill="#FBF676" />
          </svg>
        </div>

        <p className="relative z-10 text-xs text-[#9FB8C9]/70">© {new Date().getFullYear()} Crown Bankers</p>
      </div>

      {/* Right — form panel */}
      <div
        className="relative flex items-center justify-center px-6 py-14 sm:px-10"
        style={{ backgroundColor: '#0C1A6B' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] md:hidden"
          style={{
            backgroundImage:
              'linear-gradient(#FBF676 1px, transparent 1px), linear-gradient(90deg, #FBF676 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        ></div>

        <div className="relative z-10 w-full max-w-2xl fade-up">
          <div className="flex md:hidden justify-center mb-8">
            <Link href="/">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={150}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#FBF676' }}>
            Get Started
          </p>
          <h2
            className="text-3xl mb-2 text-[#F6F5EC]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Create your account
          </h2>

          {referrerFromUrl && (
            <div
              className="mt-4 mb-2 border-l-2 px-4 py-3 rounded-r-md"
              style={{ borderColor: '#FBF676', backgroundColor: 'rgba(251,246,118,0.08)' }}
            >
              <p className="text-sm font-medium" style={{ color: '#FBF676' }}>
                You're signing up with a referral link — referrer and position have been set automatically.
              </p>
            </div>
          )}

          <p className="text-sm text-[#9FB8C9] mb-9">
            Already have an account?{' '}
            <a href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#FBF676' }}>
              Sign in instead
            </a>
          </p>

          <form className="space-y-7" onSubmit={handleSubmit}>
            {error && (
              <div className="border-l-2 border-red-400 bg-red-400/10 px-4 py-3 rounded-r-md">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className={labelCls}>
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={inputCls}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {isAdmin ? (
                <>
                  <div>
                    <label htmlFor="email" className={labelCls}>
                      Email <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={inputCls}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelCls}>
                      Phone (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={inputCls}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="email" className={labelCls}>
                      Email <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={inputCls}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelCls}>
                      Phone <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={inputCls}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className={labelCls}>
                      Country <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      className={`underline-select w-full py-2.5 text-sm font-medium text-[#F6F5EC] ${!formData.country ? 'text-[#9FB8C9]/50' : ''}`}
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="" className="bg-[#0C1A6B]">
                        Select your country
                      </option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name} className="bg-[#0C1A6B]">
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="referrerId" className={labelCls}>
                      Referrer ID {referrerFromUrl && <span style={{ color: '#FBF676' }}>(From Link)</span>}
                    </label>
                    <input
                      id="referrerId"
                      name="referrerId"
                      type="text"
                      disabled={referrerFromUrl}
                      className={inputCls}
                      style={
                        !referrerFromUrl && referrerValidation.valid === false
                          ? { borderBottomColor: '#f87171' }
                          : !referrerFromUrl && referrerValidation.valid === true
                          ? { borderBottomColor: '#FBF676' }
                          : undefined
                      }
                      placeholder="CROWN-XXXXXX"
                      value={formData.referrerId}
                      onChange={handleChange}
                    />
                    {referrerFromUrl && (
                      <p className="mt-1.5 text-xs font-medium" style={{ color: '#FBF676' }}>
                        Referrer ID was automatically filled from your referral link
                      </p>
                    )}
                    {!referrerFromUrl && formData.referrerId && (
                      <div className="mt-1.5">
                        {referrerValidation.checking ? (
                          <p className="text-xs text-[#9FB8C9] flex items-center font-medium">
                            <svg className="animate-spin h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating referrer ID...
                          </p>
                        ) : referrerValidation.valid === true ? (
                          <p className="text-xs font-medium flex items-center" style={{ color: '#FBF676' }}>
                            <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {referrerValidation.message}
                          </p>
                        ) : referrerValidation.valid === false ? (
                          <p className="text-xs font-medium text-red-300 flex items-center">
                            <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {referrerValidation.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="position" className={labelCls}>
                      Position {referrerFromUrl && <span style={{ color: '#FBF676' }}>(From Link)</span>}
                    </label>
                    <select
                      id="position"
                      name="position"
                      disabled={referrerFromUrl}
                      className="underline-select w-full py-2.5 text-sm font-medium text-[#F6F5EC]"
                      value={formData.position}
                      onChange={handleChange}
                    >
                      <option value="left" className="bg-[#0C1A6B]">
                        Left
                      </option>
                      <option value="right" className="bg-[#0C1A6B]">
                        Right
                      </option>
                    </select>
                    {referrerFromUrl && (
                      <p className="mt-1.5 text-xs font-medium" style={{ color: '#FBF676' }}>
                        Position was automatically set from your referral link
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className={labelCls}>
                  Password <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className={`${inputCls} pr-10`}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center text-[#9FB8C9] hover:text-[#FBF676] focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelCls}>
                  Confirm Password <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className={`${inputCls} pr-10`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center text-[#9FB8C9] hover:text-[#FBF676] focus:outline-none transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
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

            <button
              type="submit"
              disabled={loading}
              className="cta-shimmer relative overflow-hidden w-full flex justify-center items-center py-3.5 px-4 rounded-md text-sm font-semibold tracking-[0.08em] uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: '#FBF676', color: '#0C1A6B' }}
            >
              {loading ? (
                <span className="flex items-center normal-case tracking-normal">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4"
                    style={{ color: '#0C1A6B' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<CrownLoader fullScreen />}>
      <SignupContent />
    </Suspense>
  );
}