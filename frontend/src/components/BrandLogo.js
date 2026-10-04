import React from 'react';

export const BRAND_NAME = 'ZAYRO';

/**
 * ZAYRO mark + wordmark, used by the navbar, footer, auth pages and admin.
 * The mark is a transparent PNG cut from public/logo/logo.jpg (72px and 144px
 * tall for normal and high-density screens).
 */
const BrandLogo = ({ suffix, markClassName = 'h-9', nameClassName = 'text-xl', className = '' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <img
      src="/logo/zayro-mark-72.png"
      srcSet="/logo/zayro-mark-72.png 1x, /logo/zayro-mark-144.png 2x"
      alt=""
      width="64"
      height="72"
      className={`${markClassName} w-auto flex-shrink-0`}
    />
    <span className={`font-display font-extrabold tracking-[0.2em] ${nameClassName}`}>
      {BRAND_NAME}
      {suffix && <span className="ml-2 font-semibold tracking-normal opacity-60">{suffix}</span>}
    </span>
  </span>
);

export default BrandLogo;
