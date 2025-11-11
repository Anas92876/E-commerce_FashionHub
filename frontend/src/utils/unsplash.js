/**
 * Unsplash Image Helpers
 *
 * Utility functions for working with Unsplash images
 * Includes optimization, collections, and category-specific helpers
 */

/**
 * Get optimized Unsplash image URL
 *
 * @param {string} query - Search query or collection ID
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Optimized image URL
 */
export const getUnsplashImage = (query, width = 800, height = 600) => {
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
};

/**
 * Fashion Collection Images
 * Curated fashion photography collections
 */
export const getFashionImage = (width = 800, height = 600) => {
  return `https://source.unsplash.com/collection/1163637/${width}x${height}`;
};

export const getMinimalistFashionImage = (width = 800, height = 600) => {
  return `https://source.unsplash.com/collection/4343862/${width}x${height}`;
};

export const getClothingDetailsImage = (width = 800, height = 600) => {
  return `https://source.unsplash.com/collection/3968088/${width}x${height}`;
};

/**
 * Category-Specific Images
 * Get images for specific product categories
 */
export const getCategoryImage = (category, width = 400, height = 500) => {
  const categoryQueries = {
    women: 'woman,fashion,clothing',
    men: 'man,fashion,clothing',
    accessories: 'fashion,accessories,jewelry',
    shoes: 'shoes,sneakers,footwear',
    bags: 'handbag,purse,bag,fashion',
    jackets: 'jacket,outerwear,fashion',
    dresses: 'dress,fashion,elegant',
    shirts: 'shirt,fashion,clothing',
    pants: 'pants,trousers,fashion',
    sportswear: 'sportswear,activewear,gym',
  };

  const query = categoryQueries[category?.toLowerCase()] || 'fashion,clothing';
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
};

/**
 * Hero/Banner Images
 * Large format images for hero sections
 */
export const getHeroImage = (theme = 'fashion') => {
  const themes = {
    fashion: 'https://source.unsplash.com/collection/1163637/1920x1080',
    lifestyle: 'https://source.unsplash.com/collection/4343862/1920x1080',
    minimal: 'https://source.unsplash.com/1920x1080/?minimalist,fashion',
    urban: 'https://source.unsplash.com/1920x1080/?urban,fashion,street',
  };

  return themes[theme] || themes.fashion;
};

/**
 * Product Images
 * Specific product type images
 */
export const getProductImage = (productType, width = 600, height = 800) => {
  const productQueries = {
    tshirt: 't-shirt,fashion,clothing',
    hoodie: 'hoodie,sweatshirt,fashion',
    jeans: 'jeans,denim,fashion',
    sneakers: 'sneakers,shoes,fashion',
    watch: 'watch,accessories,luxury',
    sunglasses: 'sunglasses,accessories,fashion',
    hat: 'hat,cap,fashion,accessories',
    backpack: 'backpack,bag,fashion',
  };

  const query = productQueries[productType?.toLowerCase()] || 'fashion,product';
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
};

/**
 * Optimize any Unsplash URL
 * Add optimization parameters to existing URL
 *
 * @param {string} url - Original Unsplash URL
 * @param {object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const optimizeImage = (url, options = {}) => {
  if (!url || !url.includes('unsplash')) return url;

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    fit = 'crop',
  } = options;

  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    fm: format,
    fit,
  });

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Get random fashion image with seed
 * Use seed for consistent images across page reloads
 *
 * @param {string} seed - Random seed (e.g., product ID)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Image URL
 */
export const getSeededImage = (seed, width = 800, height = 600) => {
  return `https://source.unsplash.com/random/${width}x${height}?fashion&sig=${seed}`;
};

/**
 * Responsive Image Sizes
 * Generate srcset for responsive images
 */
export const getResponsiveSizes = (baseUrl) => {
  const sizes = [
    { width: 400, descriptor: '400w' },
    { width: 800, descriptor: '800w' },
    { width: 1200, descriptor: '1200w' },
    { width: 1600, descriptor: '1600w' },
  ];

  return sizes
    .map(({ width, descriptor }) =>
      `${optimizeImage(baseUrl, { width })} ${descriptor}`
    )
    .join(', ');
};

/**
 * Placeholder Image
 * Tiny blur placeholder for lazy loading
 */
export const getPlaceholder = (url) => {
  return optimizeImage(url, {
    width: 40,
    height: 40,
    quality: 20,
    fit: 'crop',
  });
};

/**
 * Predefined Image Sets
 * Ready-to-use image URLs for common scenarios
 */
export const imagePresets = {
  hero: {
    main: getHeroImage('fashion'),
    lifestyle: getHeroImage('lifestyle'),
    minimal: getHeroImage('minimal'),
    urban: getHeroImage('urban'),
  },
  categories: {
    women: getCategoryImage('women'),
    men: getCategoryImage('men'),
    accessories: getCategoryImage('accessories'),
    shoes: getCategoryImage('shoes'),
  },
  products: {
    featured: getFashionImage(600, 800),
    grid: getFashionImage(400, 500),
    thumbnail: getFashionImage(200, 250),
    detail: getFashionImage(800, 1000),
  },
};

export default {
  getUnsplashImage,
  getFashionImage,
  getMinimalistFashionImage,
  getCategoryImage,
  getHeroImage,
  getProductImage,
  optimizeImage,
  getSeededImage,
  getResponsiveSizes,
  getPlaceholder,
  imagePresets,
};
