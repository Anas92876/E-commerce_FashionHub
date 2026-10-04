const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const { protect, admin } = require('../middleware/auth');
const { supabase, STORAGE_BUCKET } = require('../config/supabase');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ALLOWED_FOLDERS = ['products', 'categories'];

// @desc    Get a one-time signed URL so the browser can upload an image straight
//          to Supabase Storage (avoids Vercel's 4.5 MB request body limit)
// @route   POST /api/uploads/sign
// @access  Private/Admin
router.post('/sign', protect, admin, async (req, res, next) => {
  try {
    const { fileName = 'image', contentType, folder = 'products' } = req.body;

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPG, PNG, GIF, WEBP and AVIF images are allowed',
      });
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return res.status(400).json({ success: false, message: 'Invalid folder' });
    }

    const ext = path.extname(String(fileName)).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
    const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}${ext}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (error) throw new Error(`Could not create upload URL: ${error.message}`);

    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);

    res.status(200).json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        path: objectPath,
        publicUrl: publicData.publicUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
