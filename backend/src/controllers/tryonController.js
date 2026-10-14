const Profile = require('../models/Profile');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const { isSafeHttpsUrl } = require('../utils/safeUrl');

// One preview at a time per user, so a double-click can't burn the free GPU quota.
const inFlight = new Set();

function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(fileBuffer);
  });
}

// POST /api/tryon   body: { garmentUrl, description }
// Puts the garment on the user's saved full-body photo using the AI service.
const tryOn = async (req, res) => {
  const { garmentUrl, description } = req.body || {};
  if (!isSafeHttpsUrl(garmentUrl)) {
    return res.status(400).json({ message: 'Try-on needs a real photo of the garment (a public https image link).' });
  }

  const profile = await Profile.findOne({ user: req.userId });
  if (!profile || !profile.bodyPhotoUrl) {
    return res.status(404).json({ message: 'Upload your photos first so we have a full-body photo to dress.' });
  }

  if (inFlight.has(req.userId)) {
    return res.status(429).json({ message: 'A preview is already being generated. Please wait for it to finish.' });
  }
  inFlight.add(req.userId);

  try {
    const { data } = await axios.post(
      `${process.env.AI_SERVICE_URL}/tryon`,
      { personUrl: profile.bodyPhotoUrl, garmentUrl, description: String(description || 'garment').slice(0, 80) },
      { timeout: 180000 }
    );
    const imageUrl = await uploadToCloudinary(Buffer.from(data.imageBase64, 'base64'), 'fitcheck/tryon');
    res.status(200).json({ imageUrl });
  } catch (err) {
    const status = err.response && err.response.status;
    const detail = err.response && err.response.data && err.response.data.detail;
    if (err.code === 'ECONNREFUSED') {
      return res.status(502).json({ message: 'The AI service is not running.' });
    }
    res.status(status === 429 ? 429 : 502).json({
      message: detail || 'The try-on service did not respond. Please try again in a few minutes.',
    });
  } finally {
    inFlight.delete(req.userId);
  }
};

module.exports = { tryOn };
