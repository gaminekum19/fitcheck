const OwnedItem = require('../models/OwnedItem');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');

function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(fileBuffer);
  });
}

// Asks the Python service for the dominant colour name of a garment photo.
// Returns null if the service is down, so adding an item never fails because of it.
async function detectColor(imageUrl) {
  try {
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/dominant-color`, { imageUrl }, { timeout: 15000 });
    return data.color || null;
  } catch (err) {
    console.error('Colour detection skipped:', err.message);
    return null;
  }
}

// POST /api/closet  (multipart: image + garmentType, color, styleTag)
// If a photo is uploaded and no colour is typed, the colour is detected automatically.
const addOwnedItem = async (req, res) => {
  try {
    const { garmentType, styleTag } = req.body;
    let color = (req.body.color || '').trim().toLowerCase();
    if (!garmentType) {
      return res.status(400).json({ message: 'garmentType is required (top, bottom, footwear or dress).' });
    }

    let imageUrl = null;
    let autoTagged = false;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'fitcheck/owned-items');
      if (!color) {
        const detected = await detectColor(imageUrl);
        if (detected) { color = detected; autoTagged = true; }
      }
    }

    const item = await OwnedItem.create({
      user: req.userId,
      garmentType,
      color: color || undefined,
      styleTag: styleTag ? styleTag.trim().toLowerCase() : undefined,
      imageUrl,
    });

    res.status(201).json({ message: 'Item added to your closet!', item, autoTagged });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

const getMyClosetItems = async (req, res) => {
  try {
    const items = await OwnedItem.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

const deleteOwnedItem = async (req, res) => {
  try {
    const item = await OwnedItem.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.status(200).json({ message: 'Item removed from your closet.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

module.exports = { addOwnedItem, getMyClosetItems, deleteOwnedItem };
