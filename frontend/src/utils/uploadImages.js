import axios from 'axios';
import { API_URL } from './api';

// Upload one image straight from the browser to Supabase Storage.
// The API hands out a one-time signed URL, so the image never passes through
// the API itself (Vercel limits API requests to 4.5 MB).
// Returns the image's public URL.
export const uploadImage = async (file, folder = 'products') => {
  const token = localStorage.getItem('token');

  const { data } = await axios.post(
    `${API_URL}/uploads/sign`,
    { fileName: file.name, contentType: file.type, folder },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const body = new FormData();
  body.append('cacheControl', '3600');
  body.append('', file);

  const response = await fetch(data.data.signedUrl, { method: 'PUT', body });
  if (!response.ok) {
    let message = `Image upload failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      // response had no JSON body
    }
    throw new Error(`${file.name}: ${message}`);
  }

  return data.data.publicUrl;
};

// Upload several images in parallel; resolves to their URLs in the same order
export const uploadImages = (files, folder = 'products') =>
  Promise.all(files.map((file) => uploadImage(file, folder)));
