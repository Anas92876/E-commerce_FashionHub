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
    <div className="bg-ink px-4 py-2.5 text-center text-xs text-white sm:text-sm dark:bg-gray-900">
      {amount}
      {condition} with code{' '}
      <span className="font-mono font-semibold tracking-wide">{coupon.code}</span> at checkout
    </div>
  );
};

export default OfferBar;
