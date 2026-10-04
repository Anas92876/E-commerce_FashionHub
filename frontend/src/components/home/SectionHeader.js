import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Title row shared by the home page sections: heading on the left,
// optional "view all" style link (or any `action`, e.g. slider arrows) on the right
const SectionHeader = ({ id, title, description, linkTo, linkLabel, action }) => (
  <div className="mb-8 flex items-end justify-between gap-6">
    <div>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-ink dark:text-white sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-2 text-sm text-stone-600 dark:text-gray-400 sm:text-base">{description}</p>}
    </div>
    {action}
    {linkTo && (
      <Link
        to={linkTo}
        className="group inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline focus:outline-none focus-visible:underline dark:text-white"
      >
        {linkLabel}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
