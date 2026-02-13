/**
 * Utility functions for optimization and common operations
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Debounce function to limit the rate of function calls
 * Useful for search inputs, resize events, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate of function calls
 * Ensures function is called at most once per wait period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sanitize string input to prevent XSS
 * Basic implementation - for production, consider using DOMPurify
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/** UK timezone: Europe/London (GMT in winter, BST in summer). Use for all UI date/time display. */
export const UK_TIMEZONE = 'Europe/London';

/**
 * Format date string in UK time (date only)
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: UK_TIMEZONE,
    ...options,
  }).format(date);
}

/**
 * Format date and time in UK timezone. Returns { date, time } for separate display.
 */
export function formatDateTimeUK(dateString: string | Date): { date: string; time: string } {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return {
    date: date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: UK_TIMEZONE }),
    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: UK_TIMEZONE, hour12: false }),
  };
}

/**
 * Single string for date + time in UK (e.g. "13 Feb 2026, 17:47:22")
 */
export function formatDateTimeLongUK(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: UK_TIMEZONE,
    hour12: false,
  });
}

/**
 * For CSV/export: compact UK datetime string
 */
export function formatDateTimeForExportUK(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString('en-GB', { timeZone: UK_TIMEZONE, hour12: false });
}
