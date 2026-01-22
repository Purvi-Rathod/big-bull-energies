'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const reportTabs = [
  { id: 'daily-business', name: 'Daily Business', href: '/admin/reports/daily-business' },
  { id: 'nowpayments', name: 'NOWPayments', href: '/admin/reports/nowpayments' },
  { id: 'country-business', name: 'Country Business', href: '/admin/reports/country-business' },
  { id: 'investments', name: 'Investments', href: '/admin/reports/investments' },
  { id: 'withdrawals', name: 'Withdrawals', href: '/admin/reports/withdrawals' },
  { id: 'binary', name: 'Binary', href: '/admin/reports/binary' },
  { id: 'referral', name: 'Referral', href: '/admin/reports/referral' },
  { id: 'roi', name: 'ROI Transactions', href: '/admin/reports/roi' },
  { id: 'roi-statistics', name: 'ROI Statistics', href: '/admin/reports/roi-statistics' },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const activeTab = reportTabs.find(tab => pathname?.startsWith(tab.href))?.id || 'all-transactions';

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Reports</h1>
        <p className="mt-2 text-base text-gray-700">View detailed reports and analytics</p>
      </div>

      {/* Subtabs */}
      <div className="mb-6">
        <div 
          className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-2 border-2 border-indigo-200 overflow-x-auto reports-tabs-container shadow-lg"
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#818cf8 #e0e7ff',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <nav className="flex space-x-2" style={{ minWidth: 'max-content' }}>
            {reportTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                  } whitespace-nowrap py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex-shrink-0`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content from child routes */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

