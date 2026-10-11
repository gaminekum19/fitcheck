// Run with: npm run seed
// This populates a handful of sample products so you can test the
// recommendation engine immediately. REPLACE these with your real,
// manually-curated affiliate products before going live — these
// affiliateUrl values are placeholders, not real affiliate links.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Mustard A-Line Western Dress',
    imageUrl: 'https://via.placeholder.com/300x400.png?text=Mustard+Dress',
    price: 1299,
    category: 'western-dresses',
    garmentType: 'dress',
    colorTags: ['warm', 'mustard', 'earthy'],
    silhouetteTags: ['aline', 'pear', 'apple'],
    platform: 'Myntra',
    affiliateUrl: 'https://www.myntra.com/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'dress-001',
  },
  {
    name: 'Emerald Wrap Dress',
    imageUrl: 'https://via.placeholder.com/300x400.png?text=Emerald+Wrap+Dress',
    price: 1799,
    category: 'western-dresses',
    garmentType: 'dress',
    colorTags: ['cool', 'jewel', 'emerald'],
    silhouetteTags: ['wrap', 'hourglass'],
    platform: 'Amazon',
    affiliateUrl: 'https://www.amazon.in/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'dress-002',
  },
  {
    name: 'Tan Block-Heel Sandals',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Tan+Sandals',
    price: 899,
    category: 'western-dresses',
    garmentType: 'footwear',
    colorTags: ['warm', 'earthy'],
    silhouetteTags: ['aline', 'hourglass', 'rectangle'],
    platform: 'Flipkart',
    affiliateUrl: 'https://www.flipkart.com/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'footwear-001',
  },
  {
    name: 'Olive Green Straight-Fit Jeans',
    imageUrl: 'https://via.placeholder.com/300x400.png?text=Olive+Jeans',
    price: 1499,
    category: 'jeans-tops',
    garmentType: 'bottom',
    colorTags: ['warm', 'olive'],
    silhouetteTags: ['rectangle', 'hourglass'],
    platform: 'Myntra',
    affiliateUrl: 'https://www.myntra.com/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'bottom-001',
  },
  {
    name: 'Rust Boatneck Top',
    imageUrl: 'https://via.placeholder.com/300x400.png?text=Rust+Top',
    price: 699,
    category: 'jeans-tops',
    garmentType: 'top',
    colorTags: ['warm', 'rust', 'terracotta'],
    silhouetteTags: ['boatneck', 'pear'],
    platform: 'Meesho',
    affiliateUrl: 'https://www.meesho.com/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'top-001',
  },
  {
    name: 'White Sneakers',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=White+Sneakers',
    price: 1199,
    category: 'jeans-tops',
    garmentType: 'footwear',
    colorTags: ['neutral', 'white'],
    silhouetteTags: ['rectangle', 'invertedTriangle'],
    platform: 'Amazon',
    affiliateUrl: 'https://www.amazon.in/REPLACE_WITH_REAL_AFFILIATE_LINK',
    productGroupId: 'footwear-002',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding products...');

  await Product.deleteMany({}); // clear existing sample data
  await Product.insertMany(sampleProducts);

  console.log(`Inserted ${sampleProducts.length} sample products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
