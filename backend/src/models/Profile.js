const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  undertone: { type: String, enum: ['warm', 'cool', 'neutral'] },
  depth: { type: String, enum: ['light', 'medium', 'deep'] },
  bodyShape: { type: String, enum: ['hourglass', 'pear', 'rectangle', 'apple', 'invertedTriangle'] },
  selfieUrl: { type: String },
  bodyPhotoUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
