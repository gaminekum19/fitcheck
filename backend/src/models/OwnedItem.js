const mongoose = require('mongoose');

const ownedItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garmentType: { type: String, required: true }, // e.g. 'top', 'bottom', 'footwear', 'dress'
  color: { type: String },
  styleTag: { type: String }, // e.g. 'casual', 'formal', 'ethnic'
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('OwnedItem', ownedItemSchema);
