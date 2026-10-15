const cloudinary = require('../config/cloudinary');
const Profile = require('../models/Profile');
const axios = require('axios');
const { aiHeaders } = require('../config/aiHeaders');

// Helper: upload a file buffer to Cloudinary and return the URL
function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

// POST /api/profile/upload-images
// Expects two files: 'selfie' and 'bodyPhoto', sent as multipart/form-data
const uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.selfie || !req.files.bodyPhoto) {
      return res.status(400).json({ message: 'Both a selfie and a full-body photo are required.' });
    }

    const selfieFile = req.files.selfie[0];
    const bodyPhotoFile = req.files.bodyPhoto[0];

    // 1. Upload both images to Cloudinary
    const selfieUrl = await uploadToCloudinary(selfieFile.buffer, 'fitcheck/selfies');
    const bodyPhotoUrl = await uploadToCloudinary(bodyPhotoFile.buffer, 'fitcheck/body-photos');

    // 2. Send both image URLs to the Python AI service for analysis
    let analysisResult;
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, { selfieUrl, bodyPhotoUrl }, { headers: aiHeaders(), timeout: 120000 });
      analysisResult = aiResponse.data;
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      return res.status(502).json({
        message: 'Image analysis service is currently unavailable. Please make sure the AI service is running.',
        error: aiError.message,
      });
    }

    // 3. Save (or update) the user's profile with the derived categories
    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        selfieUrl,
        bodyPhotoUrl,
        undertone: analysisResult.undertone,
        depth: analysisResult.depth,
        bodyShape: analysisResult.bodyShape,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Analysis complete!', profile });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong during image upload.', error: error.message });
  }
};

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'No profile found yet. Please upload your photos first.' });
    }
    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

module.exports = { uploadImages, getMyProfile };
