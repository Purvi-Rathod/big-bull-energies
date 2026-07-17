'use client';

import React, { useMemo } from 'react';

interface BigBullLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function BigBullLoader({ 
  size = 'md', 
  text = 'BIG BULL',
  fullScreen = false,
  className = ''
}: BigBullLoaderProps) {
  const sizeClasses = {
    sm: {
      container: 'w-32 h-32',
      text: 'text-2xl',
      arcSize: 60,
      strokeWidth: 3,
      viewBoxSize: 160,
    },
    md: {
      container: 'w-48 h-48',
      text: 'text-4xl',
      arcSize: 90,
      strokeWidth: 4,
      viewBoxSize: 220,
    },
    lg: {
      container: 'w-64 h-64',
      text: 'text-5xl',
      arcSize: 120,
      strokeWidth: 5,
      viewBoxSize: 280,
    },
  };

  const currentSize = sizeClasses[size];
  const radius = currentSize.arcSize;
  const center = currentSize.viewBoxSize / 2;
  const arcLength = Math.PI * radius * 0.4;
  const circumference = Math.PI * radius * 2;

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black z-50'
    : 'flex items-center justify-center';

  const uniqueId = useMemo(() => `bigbull-loader-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <>
      <div className={`${containerClass} ${className} bigbull-loader-container`}>
        <div className={`relative ${currentSize.container} flex items-center justify-center`}>
          {/* SVG container for animated arcs */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            viewBox={`0 0 ${currentSize.viewBoxSize} ${currentSize.viewBoxSize}`}
            style={{ 
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Filter for glow effect */}
            <defs>
              <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id={`arcGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FCD34D" stopOpacity="1" />
                <stop offset="50%" stopColor="#FBBF24" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* First rotating arc (top-left, sweeping down-right) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#arcGradient-${uniqueId})`}
              strokeWidth={currentSize.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={0}
              filter={`url(#glow-${uniqueId})`}
              className="bigbull-arc-1"
              style={{
                transformOrigin: `${center}px ${center}px`,
              }}
            />

            {/* Second rotating arc (bottom-right, sweeping up-left) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#arcGradient-${uniqueId})`}
              strokeWidth={currentSize.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={arcLength}
              filter={`url(#glow-${uniqueId})`}
              className="bigbull-arc-2"
              style={{
                transformOrigin: `${center}px ${center}px`,
              }}
            />
          </svg>

          {/* BIG BULL text */}
          <div
            className={`relative z-10 font-bold ${currentSize.text} text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600`}
            style={{
              textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.5)',
              filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </>
  );
}
