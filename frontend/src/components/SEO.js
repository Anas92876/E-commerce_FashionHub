import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component
 *
 * Manages page-specific metadata for SEO optimization
 *
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {string} keywords - SEO keywords
 * @param {string} ogImage - Open Graph image URL
 * @param {string} ogType - Open Graph type (website, product, etc.)
 * @param {string} canonicalUrl - Canonical URL for the page
 * @param {object} structuredData - JSON-LD structured data
 */
export default function SEO({
  title = 'FashionHub - Your Premium Fashion Destination',
  description = 'Discover the latest fashion trends at FashionHub. Shop premium clothing, accessories, and more with fast shipping and easy returns.',
  keywords = 'fashion, clothing, online shopping, apparel, fashion trends, premium fashion',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  structuredData
}) {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://e-commerce-fashionhub-one.vercel.app';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const fullCanonicalUrl = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="FashionHub" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Generate Product Structured Data
 */
export function generateProductSchema(product) {
  if (!product) return null;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url || img) || [],
    sku: product.sku || product._id,
    brand: {
      '@type': 'Brand',
      name: 'FashionHub'
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.REACT_APP_SITE_URL || 'https://e-commerce-fashionhub-one.vercel.app'}/products/${product._id}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    aggregateRating: product.averageRating && product.numberOfReviews ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.numberOfReviews
    } : undefined
  };
}

/**
 * Generate Organization Structured Data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FashionHub',
    url: process.env.REACT_APP_SITE_URL || 'https://e-commerce-fashionhub-one.vercel.app',
    logo: `${process.env.REACT_APP_SITE_URL || 'https://e-commerce-fashionhub-one.vercel.app'}/logo192.png`,
    description: 'Your premium fashion destination for the latest trends and styles',
    sameAs: [
      // Add social media links here if available
    ]
  };
}

/**
 * Generate Breadcrumb Structured Data
 */
export function generateBreadcrumbSchema(items) {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://e-commerce-fashionhub-one.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${siteUrl}${item.url}` : undefined
    }))
  };
}
