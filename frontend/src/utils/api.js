// Centralized API configuration
// Ensure API_URL always ends with /api
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Debug logging (remove in production if needed)
  console.log('REACT_APP_API_URL from env:', envUrl);
  
  if (!envUrl) {
    const defaultUrl = 'http://localhost:5000/api';
    console.log('Using default API_URL:', defaultUrl);
    return defaultUrl;
  }
  
  // Ensure it starts with http:// or https://
  let url = envUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // If it already includes /api, return as is
  if (url.includes('/api')) {
    const finalUrl = url.endsWith('/api') ? url : `${url}/api`;
    console.log('Final API_URL (with /api):', finalUrl);
    return finalUrl;
  }
  
  // Otherwise, add /api
  const finalUrl = `${url.replace(/\/$/, '')}/api`;
  console.log('Final API_URL (added /api):', finalUrl);
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
