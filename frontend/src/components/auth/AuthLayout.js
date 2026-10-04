import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Same brand mark as the navbar
const Logo = () => (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C10 2 8.5 3 7.5 4.5C6.5 6 6 8 6 10C6 11 6.2 11.8 6.5 12.5C5.8 12.8 5.2 13.2 4.7 13.7C4 14.4 3.5 15.3 3.2 16.3C3 17 2.9 17.7 2.9 18.5C2.9 19.3 3 20 3.3 20.7C3.6 21.4 4 22 4.6 22.4C5.2 22.8 5.9 23 6.7 23C7.5 23 8.2 22.8 8.8 22.4C9.4 22 9.8 21.4 10.1 20.7C10.4 20 10.5 19.3 10.5 18.5C10.5 17.7 10.4 17 10.1 16.3C9.8 15.6 9.4 15 8.8 14.6C8.2 14.2 7.5 14 6.7 14C6.5 14 6.3 14 6.1 14.1C6 13.5 5.9 12.8 5.9 12C5.9 10.3 6.3 8.6 7.1 7.2C7.9 5.8 9 4.8 10.5 4.3C11 4.1 11.5 4 12 4C12.5 4 13 4.1 13.5 4.3C15 4.8 16.1 5.8 16.9 7.2C17.7 8.6 18.1 10.3 18.1 12C18.1 12.8 18 13.5 17.9 14.1C17.7 14 17.5 14 17.3 14C16.5 14 15.8 14.2 15.2 14.6C14.6 15 14.2 15.6 13.9 16.3C13.6 17 13.5 17.7 13.5 18.5C13.5 19.3 13.6 20 13.9 20.7C14.2 21.4 14.6 22 15.2 22.4C15.8 22.8 16.5 23 17.3 23C18.1 23 18.8 22.8 19.4 22.4C20 22 20.4 21.4 20.7 20.7C21 20 21.1 19.3 21.1 18.5C21.1 17.7 21 17 20.8 16.3C20.5 15.3 20 14.4 19.3 13.7C18.8 13.2 18.2 12.8 17.5 12.5C17.8 11.8 18 11 18 10C18 8 17.5 6 16.5 4.5C15.5 3 14 2 12 2Z" />
  </svg>
);

/**
 * Sign in / sign up page shell, matching the home hero: the form on the warm
 * canvas, and on desktop a full-height campaign photo bleeding off the right
 * edge with an editorial line in Playfair italic.
 *
 * `image` is a base path; `${image}-640.webp` and `${image}-960.webp` must exist.
 */
const AuthLayout = ({ eyebrow, title, accent, intro, image, imageAlt, tagline, children, footer }) => (
  <div className="min-h-screen bg-canvas text-ink dark:bg-gray-950 dark:text-white lg:grid lg:grid-cols-2">
    {/* ---------------- Form side */}
    <main className="flex min-h-screen flex-col px-4 py-6 sm:px-10 lg:px-16 xl:px-24">
      <header className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <span className="text-primary-600 dark:text-primary-400">
            <Logo />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">FashionHub</span>
        </Link>
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-stone-600 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          Back to store
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-gray-400">
          <span aria-hidden="true" className="h-px w-8 bg-stone-400 dark:bg-gray-600" />
          {eyebrow}
        </p>
        <h1 className="mt-5 text-[2.6rem] font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">
          {title} <span className="font-serif italic">{accent}</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-gray-300">{intro}</p>

        <div className="mt-10">{children}</div>

        {footer && <div className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-600 dark:border-gray-800 dark:text-gray-400">{footer}</div>}
      </div>
    </main>

    {/* ---------------- Campaign photo (desktop) */}
    <aside className="relative hidden overflow-hidden bg-stone-200 motion-safe:animate-hero-reveal dark:bg-gray-800 lg:sticky lg:top-0 lg:block lg:h-screen" aria-hidden="true">
      <img
        src={`${image}-960.webp`}
        srcSet={`${image}-640.webp 640w, ${image}-960.webp 960w`}
        sizes="50vw"
        alt={imageAlt}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover motion-safe:animate-hero-settle"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      <p className="absolute right-6 top-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85 [writing-mode:vertical-rl]">
        FashionHub
      </p>
      <p className="absolute bottom-10 left-10 right-10 max-w-lg text-balance font-serif text-4xl italic leading-tight text-white xl:text-5xl">
        {tagline}
      </p>
    </aside>
  </div>
);

export default AuthLayout;
