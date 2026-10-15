require('dotenv').config();

// Refuse to start with a missing or placeholder secret, because anyone could forge logins with it.
const secret = process.env.JWT_SECRET || '';
if (secret.length < 16 || secret.startsWith('change_this')) {
  console.error('JWT_SECRET is missing or too weak. Set a long random value in the environment.');
  process.exit(1);
}

const connectDB = require('./src/config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
