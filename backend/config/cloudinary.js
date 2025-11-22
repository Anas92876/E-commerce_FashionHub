const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'], // Allowed image formats
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
      { quality: 'auto' }, // Auto quality optimization
      { fetch_format: 'auto' }, // Auto format selection
    ],
  },
});

module.exports = { cloudinary, storage };
