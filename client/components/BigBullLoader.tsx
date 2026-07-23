'use client';

import Image from 'next/image';

interface BigBullLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Soft pulse loader — no spinning gold "screensaver" arcs.
 */
export default function BigBullLoader({
  size = 'md',
  text = 'Loading…',
  fullScreen = false,
  className = '',
}: BigBullLoaderProps) {
  const sizes = {
    sm: { box: 'w-16 h-16', logo: 40, label: 'text-xs' },
    md: { box: 'w-24 h-24', logo: 56, label: 'text-sm' },
    lg: { box: 'w-32 h-32', logo: 72, label: 'text-base' },
  } as const;
  const s = sizes[size];

  const shell = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4'
    : 'flex flex-col items-center justify-center gap-3 py-12';

  return (
    <div
      className={`${shell} ${className}`}
      style={
        fullScreen
          ? {
              background:
                'linear-gradient(160deg, #E8F5F0 0%, #F7FBFC 45%, #DCEEF4 100%)',
            }
          : undefined
      }
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className={`relative ${s.box} flex items-center justify-center`}>
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: '#3FA9C8' }}
        />
        <span
          className="absolute inset-2 rounded-full animate-pulse opacity-40"
          style={{
            border: '3px solid #05627C',
            borderTopColor: '#F5CF0B',
          }}
        />
        <div
          className="relative z-10 flex items-center justify-center rounded-full bg-white shadow-md"
          style={{ width: s.logo + 16, height: s.logo + 16 }}
        >
          <Image
            src="/logo2.png"
            alt=""
            width={s.logo}
            height={s.logo}
            className="object-contain"
            priority
          />
        </div>
      </div>
      <p
        className={`${s.label} font-semibold tracking-wide`}
        style={{ color: '#05627C' }}
      >
        {text}
      </p>
    </div>
  );
}
