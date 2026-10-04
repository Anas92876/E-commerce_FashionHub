import React from 'react';

/**
 * Editorial page title used across the store (matches the home hero):
 * an eyebrow with a hairline rule, a Playfair headline whose last word(s)
 * are italic, and an optional intro line.
 *
 *   <PageHeader eyebrow="Shop" title="The" accent="collection." intro="..." />
 */
const PageHeader = ({ eyebrow, title, accent, intro, children, className = '' }) => (
  <div className={className}>
    {eyebrow && (
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-gray-400">
        <span aria-hidden="true" className="h-px w-8 bg-stone-400 dark:bg-gray-600" />
        {eyebrow}
      </p>
    )}
    <h1 className="mt-5 text-[2.6rem] font-medium leading-[1.02] tracking-[-0.02em] text-ink dark:text-white sm:text-6xl">
      {title}
      {accent && (
        <>
          {' '}
          <span className="font-serif italic">{accent}</span>
        </>
      )}
    </h1>
    {intro && <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 dark:text-gray-300 sm:text-lg">{intro}</p>}
    {children}
  </div>
);

export default PageHeader;
