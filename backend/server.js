require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const closetRoutes = require('./src/routes/closetRoutes');
const productRoutes = require('./src/routes/productRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const clickRoutes = require('./src/routes/clickRoutes');
const tryonRoutes = require('./src/routes/tryonRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('FitCheck backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/closet', closetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/click', clickRoutes);
app.use('/api/tryon', tryonRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Unexpected server error.', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
