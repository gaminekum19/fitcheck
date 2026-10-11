const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
