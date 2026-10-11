const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  occasion: { type: String },
  items: [{
    source: { type: String, enum: ['owned', 'product'] },
    refId: { type: mongoose.Schema.Types.ObjectId }, // points to OwnedItem or Product
    garmentType: { type: String },
  }],
  explanationText: { type: String },
  tryOnImageUrl: { type: String },
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Outfit', outfitSchema);
