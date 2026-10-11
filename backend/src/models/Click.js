const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  platform: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Click', clickSchema);
