'use client';

import { ReactNode } from 'react';
import { dashboardTheme } from '@/lib/dashboardTheme';

interface DashboardPageShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardPageShell({
  children,
  title,
  subtitle,
}: DashboardPageShellProps) {
  return (
    <div className={dashboardTheme.page}>
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      <div className={dashboardTheme.pageInner}>
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2 text-white">
              <span className={dashboardTheme.title}>{title}</span>
            </h1>
            {subtitle && <p className={dashboardTheme.subtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
