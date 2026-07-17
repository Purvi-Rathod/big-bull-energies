'use client';

/**
 * Admin user search input with optional BIGBULL- prefix.
 * Use getEffectiveUserSearch(value, useBigBullPrefix) when calling APIs or filtering by userId.
 */
export function getEffectiveUserSearch(raw: string, useBigBullPrefix: boolean): string {
  const q = raw.trim();
  if (!q) return '';
  if (useBigBullPrefix) return 'BIGBULL-' + q.replace(/^BIGBULL-?/i, '').trim();
  return q;
}

interface AdminUserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  useBigBullPrefix: boolean;
  onUseBigBullPrefixChange: (value: boolean) => void;
  placeholderWithPrefix?: string;
  placeholderWithoutPrefix?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function AdminUserSearchInput({
  value,
  onChange,
  useBigBullPrefix,
  onUseBigBullPrefixChange,
  placeholderWithPrefix = 'e.g. 000123',
  placeholderWithoutPrefix = 'Name, email...',
  id,
  className = '',
  inputClassName = '',
  onKeyDown,
}: AdminUserSearchInputProps) {
  return (
    <div
      className={`flex w-full min-w-0 items-center rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${className}`}
    >
      {useBigBullPrefix ? (
        <span className="flex items-center gap-1 shrink-0 pl-3 pr-1 py-2 text-gray-600 font-medium">
          BIGBULL-
          <button
            type="button"
            onClick={() => onUseBigBullPrefixChange(false)}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Remove prefix to search by name or email"
            aria-label="Remove BIGBULL- prefix"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onUseBigBullPrefixChange(true)}
          className="shrink-0 pl-2 pr-1 py-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          title="Use BIGBULL- prefix for user ID search"
        >
          + BIGBULL-
        </button>
      )}
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={useBigBullPrefix ? placeholderWithPrefix : placeholderWithoutPrefix}
        className={`w-full min-w-0 px-2 py-2 text-black bg-transparent border-0 focus:outline-none focus:ring-0 ${inputClassName}`}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
