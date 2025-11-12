// Centralized API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Image base URL - for serving uploaded images
// In production, this should be your backend URL
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 
  (process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://localhost:5000');

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

