require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error('Set ADMIN_EMAIL to an existing account email.');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing.');

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { role: 'admin' } },
    { new: true }
  ).select('name email role');

  if (!user) throw new Error('No account found. Sign up first, then run this again.');
  console.log('Admin role assigned to:', user.email);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
