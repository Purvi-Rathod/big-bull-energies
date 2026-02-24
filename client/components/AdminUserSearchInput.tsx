'use client';

/**
 * Admin user search input with optional CROWN- prefix.
 * Use getEffectiveUserSearch(value, useCrownPrefix) when calling APIs or filtering by userId.
 */
export function getEffectiveUserSearch(raw: string, useCrownPrefix: boolean): string {
  const q = raw.trim();
  if (!q) return '';
  if (useCrownPrefix) return 'CROWN-' + q.replace(/^CROWN-?/i, '').trim();
  return q;
}

interface AdminUserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  useCrownPrefix: boolean;
  onUseCrownPrefixChange: (value: boolean) => void;
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
  useCrownPrefix,
  onUseCrownPrefixChange,
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
      {useCrownPrefix ? (
        <span className="flex items-center gap-1 shrink-0 pl-3 pr-1 py-2 text-gray-600 font-medium">
          CROWN-
          <button
            type="button"
            onClick={() => onUseCrownPrefixChange(false)}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Remove prefix to search by name or email"
            aria-label="Remove CROWN- prefix"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onUseCrownPrefixChange(true)}
          className="shrink-0 pl-2 pr-1 py-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          title="Use CROWN- prefix for user ID search"
        >
          + CROWN-
        </button>
      )}
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={useCrownPrefix ? placeholderWithPrefix : placeholderWithoutPrefix}
        className={`w-full min-w-0 px-2 py-2 text-black bg-transparent border-0 focus:outline-none focus:ring-0 ${inputClassName}`}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
