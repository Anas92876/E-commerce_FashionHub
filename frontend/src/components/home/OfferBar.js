import React from 'react';

/**
 * One-line announcement for a coupon the admin chose to advertise
 * ("Show on home page"). Renders nothing when no such coupon is valid.
 */
const OfferBar = ({ coupon }) => {
  if (!coupon) return null;

  const amount =
    coupon.discountType === 'percent' ? `${Number(coupon.discountValue)}% off` : `$${Number(coupon.discountValue)} off`;
  const condition = Number(coupon.minOrderAmount) > 0 ? ` orders over $${Number(coupon.minOrderAmount)}` : ' your order';

  return (
    <div className="border-b border-stone-200/80 bg-sand px-4 py-2 text-center text-xs tracking-wide text-stone-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
      {amount}
      {condition} with code{' '}
      <span className="font-semibold tracking-[0.12em] text-ink dark:text-white">{coupon.code}</span> at checkout
    </div>
  );
};

export default OfferBar;
