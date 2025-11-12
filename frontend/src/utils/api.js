// Centralized API configuration
// Ensure API_URL always ends with /api
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  // If it already includes /api, return as is
  if (envUrl.includes('/api')) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // Otherwise, add /api
  return `${envUrl.replace(/\/$/, '')}/api`;
};

export const API_URL = getApiUrl();

// Image base URL - for serving uploaded images
// In production, this should be your backend URL
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 
  (process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'https://web-production-2d7c0.up.railway.app/');

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

