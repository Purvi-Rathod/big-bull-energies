'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import CrownLoader from '@/components/CrownLoader';

function LoginContent() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for signup success message
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setSuccessMessage('Account created successfully! Please login to continue.');
      // Clear the query parameter from URL
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  // Redirect after successful login - use replace to avoid history issues
  useEffect(() => {
    if (!authLoading) {
    if (admin) {
      // Admin account login
        router.replace('/admin/dashboard');
    } else if (user) {
      // Regular user login
      if (user.userId === 'CROWN-000000' || user.userId === 'CROWN-000000') {
        // CROWN-000000 or CROWN-000000 user should be redirected to admin dashboard
          router.replace('/admin/dashboard');
      } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, admin, router, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(userId, password, isAdmin);
      // Redirect will be handled by useEffect when user/admin state updates
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
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
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect via useEffect)
  if (user || admin) {
    return null;
  }

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
      
      {/* Content */}
      <div className="relative z-10 max-w-md w-full space-y-8 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-500/30">
        <div>
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={180}
                height={60}
                className="h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>
          <h2 className="text-center text-3xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Sign in to your account
            </span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <a href="/signup" className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
              Create a new account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-600/15 to-yellow-500/20 border-2 border-yellow-500/40 text-white px-4 py-3 rounded-xl">
              <p className="font-bold text-yellow-300">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              <p className="font-bold">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="user-id" className="block text-sm font-bold text-yellow-400 mb-2">
                {isAdmin ? "Email Address" : "User ID"}
              </label>
              <input
                id="user-id"
                name="user-id"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                placeholder={isAdmin ? "Enter your email" : "User ID (CROWN-XXXXXX)"}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-yellow-400 mb-2">
                Password
              </label>
              <div className="relative">
              <input
                id="password"
                name="password"
                  type={showPassword ? "text" : "password"}
                required
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-yellow-500/40 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/70 transition-all sm:text-sm font-semibold"
                  placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center justify-between">
            {!isAdmin && (
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}
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
              Login as Admin
            </label>
          </div> */}

          <div>
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<CrownLoader fullScreen />}>
      <LoginContent />
    </Suspense>
  );
}

