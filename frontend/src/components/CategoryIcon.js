import React from 'react';

// Simple line icons for clothing categories (heroicons has none), drawn on a
// 24x24 grid in the same 1.5px-stroke style as heroicons/outline.
const PATHS = {
  shirt: 'M8 3.5 4 6l-1.5 4L6 11.2V20.5h12v-9.3l3.5-1.2L20 6l-4-2.5c-.6 1.4-2.1 2.3-4 2.3s-3.4-.9-4-2.3Z',
  jeans: 'M6.5 3h11l1 18h-4.2L12 9.5 9.7 21H5.5l1-18ZM6.5 6.5h11',
  dress: 'M9 3h6l-.5 4.5 4.5 13.5H5.5L10 7.5 9 3ZM9.6 7.5h4.8',
  jacket: 'M8.5 3.5 12 7l3.5-3.5L20 6l1 14h-4.5M8.5 3.5 4 6 3 20h4.5M12 7v13.5M7.5 20.5V11M16.5 20.5V11',
  shoe: 'M3 16.5V11c2.4 0 4-1.6 4.6-4l3.4 1.2c-.3 1.6.7 2.8 2.4 3.2L19 13c1.4.4 2 1.4 2 2.5v1H3ZM3 19.5h18',
  bag: 'M5 8h14l-1 12.5H6L5 8ZM9 10V6.5a3 3 0 0 1 6 0V10',
  tag: 'M3.5 12.5 11.5 4.5h8v8l-8 8-8-8ZM15.5 8.5h.01',
  grid: 'M4 4h6.5v6.5H4V4Zm9.5 0H20v6.5h-6.5V4ZM4 13.5h6.5V20H4v-6.5Zm9.5 0H20V20h-6.5v-6.5Z',
};

// Category name -> icon (matches common names like "T-Shirts", "Jeans", "Shoes")
const iconFor = (name = '') => {
  const n = name.toLowerCase();
  if (/shirt|tee|top|blouse/.test(n)) return 'shirt';
  if (/jean|pant|trouser|short/.test(n)) return 'jeans';
  if (/dress|skirt/.test(n)) return 'dress';
  if (/jacket|coat|outer|hoodie/.test(n)) return 'jacket';
  if (/shoe|sneaker|boot|footwear/.test(n)) return 'shoe';
  if (/accessor|bag|belt|cap|hat/.test(n)) return 'bag';
  if (n === 'all') return 'grid';
  return 'tag';
};

const CategoryIcon = ({ name, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={PATHS[iconFor(name)]} />
  </svg>
);

export default CategoryIcon;
