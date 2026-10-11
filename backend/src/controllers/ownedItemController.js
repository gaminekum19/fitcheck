const OwnedItem = require('../models/OwnedItem');
const cloudinary = require('../config/cloudinary');

function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(fileBuffer);
  });
}

// POST /api/closet - add an owned item
// Body (multipart/form-data): image file + garmentType, color, styleTag
// NOTE: automatic garment-type/color detection via CLIP is a planned
// enhancement (see docs). For now, the user tags items manually, which
// still lets the whole outfit-builder pipeline work end-to-end.
const addOwnedItem = async (req, res) => {
  try {
    const { garmentType, color, styleTag } = req.body;
    if (!garmentType) {
      return res.status(400).json({ message: 'garmentType is required (e.g. top, bottom, footwear, dress).' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'fitcheck/owned-items');
    }

    const item = await OwnedItem.create({
      user: req.userId,
      garmentType,
      color,
      styleTag,
      imageUrl,
    });

    res.status(201).json({ message: 'Item added to your closet!', item });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// GET /api/closet - list the logged-in user's owned items
const getMyClosetItems = async (req, res) => {
  try {
    const items = await OwnedItem.find({ user: req.userId });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// DELETE /api/closet/:id
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
