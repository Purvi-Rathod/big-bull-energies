'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function ImpersonateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token || !userId) {
      setError('Invalid impersonation link');
      setLoading(false);
      return;
    }

    // Opened in a new tab by admin panel. sessionStorage = per-tab, so admin tab stays logged in.
    // Set impersonation token first, then refresh auth so context shows the impersonated user
    // (not admin from shared localStorage) before redirecting to dashboard.
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('impersonatedUserId', userId);
      sessionStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('impersonatedToken', token);
      localStorage.setItem('impersonatedUserId', userId);

      refreshAuth()
        .then(() => {
          router.push('/dashboard');
        })
        .catch((err) => {
          setError(err?.message || 'Failed to authenticate as user');
          setLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when token/userId are in URL
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Logging in as user...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
            <p>{error}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ImpersonateContent />
    </Suspense>
  );
}

