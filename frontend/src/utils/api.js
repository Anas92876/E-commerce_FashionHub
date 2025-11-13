// Centralized API configuration
// Ensure API_URL always ends with /api and is a full absolute URL
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('REACT_APP_API_URL from env:', envUrl);
  }
  
  if (!envUrl) {
    const defaultUrl = 'http://localhost:5000/api';
    if (process.env.NODE_ENV === 'development') {
      console.log('Using default API_URL:', defaultUrl);
    }
    return defaultUrl;
  }
  
  // Clean and normalize the URL
  let url = String(envUrl).trim();
  
  // Remove any leading/trailing slashes and whitespace
  url = url.replace(/^\/+|\/+$/g, '').trim();
  
  // If it's empty after cleaning, use default
  if (!url) {
    const defaultUrl = 'http://localhost:5000/api';
    if (process.env.NODE_ENV === 'development') {
      console.log('Using default API_URL:', defaultUrl);
    }
    return defaultUrl;
  }
  
  // Ensure it starts with http:// or https:// (CRITICAL for absolute URLs)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Remove /api if it's in the middle or at the end, we'll add it properly
  url = url.replace(/\/api\/?$/, '');
  
  // Ensure it doesn't end with a slash
  url = url.replace(/\/$/, '');
  
  // Add /api at the end
  const finalUrl = `${url}/api`;
  
  // Always log in production to help debug
  console.log('[API Config] REACT_APP_API_URL:', envUrl);
  console.log('[API Config] Final API_URL:', finalUrl);
  
  return finalUrl;
};

export const API_URL = getApiUrl();

// Image base URL - for serving uploaded images
// In production, this should be your backend URL
const getImageBaseUrl = () => {
  // Check for explicit IMAGE_BASE_URL first
  if (process.env.REACT_APP_IMAGE_BASE_URL) {
    let url = String(process.env.REACT_APP_IMAGE_BASE_URL).trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    const finalUrl = url.endsWith('/') ? url : `${url}/`;
    console.log('[Image Config] Using REACT_APP_IMAGE_BASE_URL:', finalUrl);
    return finalUrl;
  }
  
  // Derive from API_URL
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    // Remove /api if present and ensure it ends with /
    let baseUrl = String(apiUrl).trim().replace(/\/api\/?$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    const finalUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    console.log('[Image Config] Derived from REACT_APP_API_URL:', finalUrl);
    return finalUrl;
  }
  
  // Default fallback (only for local development)
  const defaultUrl = 'http://localhost:5000/';
  console.warn('[Image Config] WARNING: No REACT_APP_API_URL or REACT_APP_IMAGE_BASE_URL set! Using default:', defaultUrl);
  console.warn('[Image Config] Please set REACT_APP_API_URL in Netlify environment variables!');
  return defaultUrl;
};

export const IMAGE_BASE_URL = getImageBaseUrl();

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('[getImageUrl] No image path provided');
    return null;
  }
  
  // If imagePath already includes http/https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure imagePath starts with / if it doesn't already
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${IMAGE_BASE_URL}${normalizedPath}`;
  
  // Log in development to help debug
  if (process.env.NODE_ENV === 'development') {
    console.log('[getImageUrl]', { imagePath, normalizedPath, IMAGE_BASE_URL, fullUrl });
  }
  
  return fullUrl;
};
