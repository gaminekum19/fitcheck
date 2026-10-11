const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g. 'western-dresses', 'jeans-tops', 'indian-traditional'
  garmentType: { type: String, required: true }, // 'top', 'bottom', 'footwear', 'dress'
  colorTags: [{ type: String }], // e.g. ['warm', 'earthy', 'mustard']
  silhouetteTags: [{ type: String }], // e.g. ['hourglass', 'rectangle']
  platform: { type: String, required: true }, // 'Amazon', 'Myntra', 'Flipkart', 'Meesho'
  affiliateUrl: { type: String, required: true },
  productGroupId: { type: String }, // used to link the same item across platforms for price comparison
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
