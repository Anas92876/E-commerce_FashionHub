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
  if (process.env.REACT_APP_IMAGE_BASE_URL) {
    const url = process.env.REACT_APP_IMAGE_BASE_URL.endsWith('/') 
      ? process.env.REACT_APP_IMAGE_BASE_URL 
      : `${process.env.REACT_APP_IMAGE_BASE_URL}/`;
    return url;
  }
  
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    // Remove /api if present and ensure it ends with /
    let baseUrl = apiUrl.replace(/\/api\/?$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }
  
  return 'http://localhost:5000/';
};

export const IMAGE_BASE_URL = getImageBaseUrl();

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If imagePath already includes http/https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the base URL
  return `${IMAGE_BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};
