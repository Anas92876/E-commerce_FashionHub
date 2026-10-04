const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { supabase, STORAGE_BUCKET } = require('../config/supabase');

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Keep files in memory, then push them to Supabase Storage
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Upload one file buffer to Supabase Storage and return its public URL
const uploadFile = async (file, folder = 'products') => {
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
};

// Public URL prefix of our bucket - only images stored there are accepted as URLs
const publicPrefix = () =>
  `${process.env.SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;

const parseUrls = (value) => {
  if (!value) return [];
  const urls = Array.isArray(value) ? value : JSON.parse(value);
  if (!Array.isArray(urls) || urls.some((url) => typeof url !== 'string' || !url.startsWith(publicPrefix()))) {
    const err = new Error('Invalid image URL');
    err.statusCode = 400;
    throw err;
  }
  return urls;
};

// After multer has parsed the request:
// - files sent directly are uploaded to Supabase Storage (works locally), or
// - `imageUrls` / `imageUrl` fields hold images the browser already uploaded to
//   Supabase with a signed URL (needed on Vercel, which limits request size).
// Either way controllers read the public URL from file.path, in order.
const toSupabase = (folder) => async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    await Promise.all(files.map(async (file) => {
      file.path = await uploadFile(file, folder);
      file.buffer = undefined;
    }));

    if (files.length === 0 && req.body) {
      const urls = parseUrls(req.body.imageUrls);
      if (urls.length) req.files = urls.map((url) => ({ path: url }));

      const [singleUrl] = parseUrls(req.body.imageUrl ? [req.body.imageUrl] : null);
      if (singleUrl) req.file = { path: singleUrl };
    }

    next();
  } catch (error) {
    if (error instanceof SyntaxError) error.statusCode = 400; // malformed imageUrls JSON
    next(error);
  }
};

// Same API as the old multer instance, e.g. upload.single('image')
const upload = {
  single: (field, folder = 'categories') => [multerUpload.single(field), toSupabase(folder)],
  array: (field, maxCount, folder = 'products') => [multerUpload.array(field, maxCount), toSupabase(folder)],
};

module.exports = upload;
module.exports.uploadFile = uploadFile;
