import React from 'react';
import BrandLogo from '../BrandLogo';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
          <BrandLogo />
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
        ZAYRO
      </p>
      <p className="absolute bottom-10 left-10 right-10 max-w-lg text-balance font-serif text-4xl italic leading-tight text-white xl:text-5xl">
        {tagline}
      </p>
    </aside>
  </div>
);

export default AuthLayout;
