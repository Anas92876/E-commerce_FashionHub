import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Labelled input for the auth forms. Shows `error` (when `showError`) below
 * the field, linked with aria-describedby / aria-invalid. `type="password"`
 * adds a show/hide button.
 */
const AuthField = ({ id, label, type = 'text', error, showError, hint, className = '', ...inputProps }) => {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const invalid = Boolean(showError && error);
  const describedBy = [invalid && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink dark:text-white">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-md border bg-white px-4 text-[15px] text-ink placeholder-stone-400 transition focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
            isPassword ? 'pr-12' : ''
          } ${
            invalid
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
              : 'border-stone-300 focus:border-primary-600 focus:ring-primary-600/20 dark:border-gray-700'
          }`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-stone-500 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-400 dark:hover:text-white"
          >
            {revealed ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
      {hint && (
        <div id={`${id}-hint`} className="mt-2">
          {hint}
        </div>
      )}
      {invalid && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthField;
