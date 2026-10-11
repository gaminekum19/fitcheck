const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadImages, getMyProfile } = require('../controllers/profileController');

router.post(
  '/upload-images',
  protect,
  upload.fields([{ name: 'selfie', maxCount: 1 }, { name: 'bodyPhoto', maxCount: 1 }]),
  uploadImages
);
router.get('/me', protect, getMyProfile);

module.exports = router;
