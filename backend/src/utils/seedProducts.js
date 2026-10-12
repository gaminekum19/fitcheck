// Run with: npm run seed
// Replaces the whole product catalogue with the sample data in catalogue.js.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { buildCatalogue } = require('./catalogue');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const docs = buildCatalogue();

  await Product.deleteMany({});
  await Product.insertMany(docs);

  const groups = new Set(docs.map((d) => d.productGroupId)).size;
  console.log(`Seeded ${docs.length} listings across ${groups} distinct items.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
