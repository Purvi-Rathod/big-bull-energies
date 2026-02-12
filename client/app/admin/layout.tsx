'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SubTab {
  name: string;
  href: string;
  count?: number;
}

interface Tab {
  name: string;
  href: string;
  icon: React.ReactNode;
  subTabs?: SubTab[];
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, admin, loading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
  const [tabCounts, setTabCounts] = useState<Record<string, Record<string, number>>>({});

  // Define navigation array
  const navigation: Tab[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'User Management',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Genealogy',
      href: '/admin/genealogy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'Withdrawals',
      href: '/admin/withdrawals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subTabs: [
        { name: 'All', href: '/admin/withdrawals?tab=all' },
        { name: 'ROI', href: '/admin/withdrawals?tab=roi' },
        { name: 'Referral', href: '/admin/withdrawals?tab=referral' },
        { name: 'Career', href: '/admin/withdrawals?tab=career_level' },
        { name: 'Binary', href: '/admin/withdrawals?tab=binary' },
        { name: 'Interest', href: '/admin/withdrawals?tab=interest' },
      ],
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8h13m0 0l-4-4m4 4l-4 4M21 16H8m0 0l4-4m-4 4l4 4" />
        </svg>
      ),
      subTabs: [
        { name: 'ROI', href: '/admin/transactions?tab=roi' },
        { name: 'Binary', href: '/admin/transactions?tab=binary' },
        { name: 'Referral', href: '/admin/transactions?tab=referral' },
        { name: 'Investment', href: '/admin/transactions?tab=investment' },
        { name: 'Withdrawal', href: '/admin/transactions?tab=withdrawal' },
        { name: 'Payment', href: '/admin/transactions?tab=payment' },
      ],
    },
    {
      name: 'Add/Remove Funds',
      href: '/admin/investments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      subTabs: [
        { name: 'Create Investment', href: '/admin/investments' },
        { name: 'Add Funds', href: '/admin/add-funds' },
        { name: 'Remove Funds', href: '/admin/remove-funds' },
      ],
    },
    {
      name: 'Influencer',
      href: '/admin/influencer/powerleg',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subTabs: [
        { name: 'Powerleg Account', href: '/admin/influencer/powerleg' },
        { name: 'Free Account', href: '/admin/influencer/free' },
        // { name: 'Create Investment', href: '/admin/influencer/investment' },
      ],
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subTabs: [
        { name: 'All Transactions', href: '/admin/reports/all-transactions' },
        { name: 'ROI Transactions', href: '/admin/reports/roi' },
        { name: 'User ROI Statistics', href: '/admin/reports/roi-statistics' },
        { name: 'Binary', href: '/admin/reports/binary' },
        { name: 'Referral', href: '/admin/reports/referral' },
        { name: 'Investments', href: '/admin/reports/investments' },
        { name: 'Withdrawals', href: '/admin/reports/withdrawals' },
        { name: 'Daily Business', href: '/admin/reports/daily-business' },
        { name: 'Country Business', href: '/admin/reports/country-business' },
        { name: 'NOWPayments', href: '/admin/reports/nowpayments' },
      ],
    },
    {
      name: 'Vouchers',
      href: '/admin/vouchers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M12 3a9 9 0 110 18 9 9 0 010-18zM12 3v18" />
        </svg>
      ),
    },
    {
      name: 'Gallery',
      href: '/admin/gallery',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Packages',
      href: '/admin/packages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Career Levels',
      href: '/admin/career-levels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      name: 'Tickets',
      href: '/admin/tickets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Route protection
  useEffect(() => {
    if (authLoading) return;

    const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
    const isAdminAccount = !!admin;

    if (!isAdminUser && !isAdminAccount) {
      router.push('/login');
    }
  }, [user, admin, authLoading, router]);

  // Fetch counts for tabs
  useEffect(() => {
    if (authLoading) return;
    
    let isFetching = false;
    let abortController: AbortController | null = null;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const fetchCounts = async () => {
      // Prevent concurrent calls
      if (isFetching) return;
      isFetching = true;
      
      // Cancel any previous requests
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      
      try {
        const transactionCounts: Record<string, number> = {};
        const withdrawalCounts: Record<string, number> = {};
        let ticketsCount = 0;
        let vouchersCount = 0;
        let withdrawalsCount = 0;
        let usersCount = 0;

        // Helper function to check if error is rate limit
        const isRateLimitError = (err: any): boolean => {
          const message = err?.message?.toLowerCase() || '';
          return message.includes('too many requests') || 
                 message.includes('rate limit') ||
                 message.includes('429');
        };

        // Batch 1: Fetch transaction counts (in smaller batches)
        const transactionTypes = ['roi', 'binary', 'referral', 'investment', 'withdrawal', 'payment'];
        for (let i = 0; i < transactionTypes.length; i += 2) {
          const batch = transactionTypes.slice(i, i + 2);
          await Promise.all(
            batch.map(async (type) => {
              try {
                const response = await api.getAdminReports({ type, page: 1, limit: 1 });
                transactionCounts[type] = response.data?.pagination?.total || 0;
              } catch (err: any) {
                if (isRateLimitError(err)) {
                  console.warn(`Rate limit reached for ${type} transactions, using default value`);
                }
                transactionCounts[type] = 0;
              }
            })
          );
          // Add delay between batches
          if (i + 2 < transactionTypes.length) {
            await delay(200);
          }
        }

        // Small delay before next batch
        await delay(300);

        // Batch 2: Fetch tickets and vouchers
        try {
          const ticketsRes = await api.getAllTickets({ page: 1, limit: 1 });
          ticketsCount = ticketsRes.data?.pagination?.total || 0;
        } catch (err: any) {
          if (isRateLimitError(err)) {
            console.warn('Rate limit reached for tickets, using default value');
          }
          ticketsCount = 0;
        }

        await delay(200);

        try {
          const vouchersRes = await api.getAllVouchers();
          vouchersCount = vouchersRes.data?.vouchers?.length || 0;
        } catch (err: any) {
          if (isRateLimitError(err)) {
            console.warn('Rate limit reached for vouchers, using default value');
          }
          vouchersCount = 0;
        }

        // Small delay before next batch
        await delay(300);

        // Batch 3: Fetch withdrawal counts (in smaller batches)
        const withdrawalTypes = [
          { apiKey: undefined, displayKey: 'all' },
          { apiKey: 'roi', displayKey: 'roi' },
          { apiKey: 'referral', displayKey: 'referral' },
          { apiKey: 'career_level', displayKey: 'career' },
          { apiKey: 'binary', displayKey: 'binary' },
          { apiKey: 'interest', displayKey: 'interest' },
        ];
        
        for (let i = 0; i < withdrawalTypes.length; i += 2) {
          const batch = withdrawalTypes.slice(i, i + 2);
          await Promise.all(
            batch.map(async ({ apiKey, displayKey }) => {
              try {
                const response = await api.getAdminWithdrawals({
                  page: 1,
                  limit: 1,
                  walletType: apiKey,
                });
                withdrawalCounts[displayKey] = response.data?.pagination?.total || 0;
              } catch (err: any) {
                if (isRateLimitError(err)) {
                  console.warn(`Rate limit reached for ${displayKey} withdrawals, using default value`);
                }
                withdrawalCounts[displayKey] = 0;
              }
            })
          );
          // Add delay between batches
          if (i + 2 < withdrawalTypes.length) {
            await delay(200);
          }
        }
        
        withdrawalsCount = withdrawalCounts.all || 0;

        // Small delay before last request
        await delay(300);

        // Batch 4: Fetch user statistics
        try {
          const statsRes = await api.getAdminStatistics();
          usersCount = statsRes.data?.totalUsers || 0;
        } catch (err: any) {
          if (isRateLimitError(err)) {
            console.warn('Rate limit reached for user statistics, using default value');
          }
          usersCount = 0;
        }

        setTabCounts({
          transactions: transactionCounts,
          tickets: { all: ticketsCount },
          vouchers: { all: vouchersCount },
          withdrawals: withdrawalCounts,
          users: { all: usersCount },
        });
      } catch (err: any) {
        // Don't log rate limit errors as errors, just warn
        if (err?.message?.toLowerCase().includes('too many requests') || 
            err?.message?.toLowerCase().includes('rate limit')) {
          console.warn('Rate limit reached while fetching counts. Will retry on next interval.');
        } else {
          console.error('Error fetching counts:', err);
        }
      } finally {
        isFetching = false;
      }
    };

    fetchCounts();
    // Refresh counts every 60 seconds (increased from 30 to reduce load)
    const interval = setInterval(fetchCounts, 60000);
    return () => {
      clearInterval(interval);
      if (abortController) {
        abortController.abort();
      }
    };
  }, [authLoading]);

  // Auto-expand tab if current path matches
  useEffect(() => {
    const currentTab = navigation.find(tab => {
      if (pathname === tab.href) return true;
      return tab.subTabs?.some(subTab => {
        const [basePath] = subTab.href.split('?');
        if (pathname?.startsWith(basePath)) {
          // For withdrawals, also check if tab param matches
          if (basePath === '/admin/withdrawals') {
            const urlParams = new URLSearchParams(subTab.href.split('?')[1] || '');
            const tabParam = urlParams.get('tab');
            const currentTabParam = searchParams?.get('tab');
            if (tabParam === 'all' && !currentTabParam) return true;
            if (tabParam && tabParam === currentTabParam) return true;
            return false;
          }
          return true;
        }
        return false;
      });
    });

    if (currentTab) {
      setExpandedTabs(prev => new Set(prev).add(currentTab.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdminUser = user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
  const isAdminAccount = !!admin;

  if (!isAdminUser && !isAdminAccount) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href.includes('?')) {
      const [basePath, queryString] = href.split('?');
      if (pathname?.startsWith(basePath)) {
        // Check if query params match
        const urlParams = new URLSearchParams(queryString);
        const tabParam = urlParams.get('tab');
        const currentTab = searchParams?.get('tab');
        
        // If no tab in URL, default to 'all' for withdrawals
        if (basePath === '/admin/withdrawals') {
          if (tabParam === 'all' && !currentTab) return true;
          if (tabParam && tabParam === currentTab) return true;
          return false;
        }
        
        // For other pages, just check base path
        return true;
      }
      return false;
    }
    return pathname?.startsWith(href);
  };

  const toggleTab = (tabName: string) => {
    setExpandedTabs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tabName)) {
        newSet.delete(tabName);
      } else {
        newSet.add(tabName);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    await logout(true);
    router.push('/');
  };

  const getSubTabCount = (tabName: string, subTabName: string): number => {
    const tabKey = tabName.toLowerCase().replace(/\s+/g, '');
    let subTabKey = subTabName.toLowerCase();
    
    // Map withdrawal subtab names to their keys
    if (tabKey === 'withdrawals') {
      if (subTabName === 'All') subTabKey = 'all';
      else if (subTabName === 'Career') subTabKey = 'career_level';
      else subTabKey = subTabName.toLowerCase();
    }
    
    return tabCounts[tabKey]?.[subTabKey] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${sidebarOpen ? 'w-72' : 'md:w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col fixed h-screen z-30 shadow-lg`}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-between px-3 border-b-2 border-indigo-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-lg">
          {sidebarOpen ? (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <p>CROWN ADMIN</p>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="flex items-center justify-center w-full">
              <Image
                src="/image.png"
                alt="Crown Bankers Logo"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-indigo-500 text-white hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-white">
          {navigation.map((tab) => {
            const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;
            const isExpanded = expandedTabs.has(tab.name);
            const tabActive = isActive(tab.href);

            return (
              <div key={tab.name} className="mb-1">
                {hasSubTabs ? (
                  <>
                    <button
                      onClick={() => toggleTab(tab.name)}
                      className={`w-full flex items-start gap-3 py-2  rounded-lg text-sm font-medium transition-colors relative pr-30 ${
                        tabActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-black hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <span className={`flex-shrink-1 w-5 h-5 flex items-start justify-start ${tabActive ? 'text-indigo-600' : 'text-black'}`}>
                        {tab.icon}
                      </span>
                      {sidebarOpen && (
                        <>
                          <span className="truncate flex-1">{tab.name}</span>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        </>
                      )}
                    </button>
                    {sidebarOpen && isExpanded && tab.subTabs && (
                      <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                        {tab.subTabs.map((subTab) => {
                          const subTabActive = isActive(subTab.href);
                          const count = getSubTabCount(tab.name, subTab.name);
                          return (
                            <Link
                              key={subTab.name}
                              href={subTab.href}
                              className={`flex items-center justify-between gap-2 py-2 rounded-md text-sm transition-colors ${
                                subTabActive
                                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                                  : 'text-black hover:bg-gray-50 hover:text-black'
                              }`}
                            >
                              <span className="truncate flex-1">{subTab.name}</span>
                              {count > 0 && (
                                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  subTabActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-black'
                                }`}>
                                  {count}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={tab.href}
                    className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tabActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-black hover:bg-gray-100 hover:text-black'
                    }`}
                    title={!sidebarOpen ? tab.name : undefined}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${tabActive ? 'text-indigo-600' : 'text-black'}`}>
                      {tab.icon}
                    </span>
                    {sidebarOpen && <span className="truncate flex-1">{tab.name}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t-2 border-indigo-200 px-3 py-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          {sidebarOpen && user && (
            <div className="mb-3 py-2 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-black mb-1 px-3">Logged in as</p>
              <p className="text-sm font-medium text-black truncate px-3">Plateform Admin</p>
              {/* <p className="text-xs text-black truncate px-3">{user.userId}</p> */}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 left-4 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white rounded-md shadow-md hover:bg-gray-100 text-black"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <main className="admin-main min-w-0 max-w-full p-2 md:p-4 pt-16 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
