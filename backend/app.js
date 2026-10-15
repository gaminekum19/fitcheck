// Builds the Express app (no database connection or listening here, so it can be tested).
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const closetRoutes = require('./src/routes/closetRoutes');
const productRoutes = require('./src/routes/productRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const clickRoutes = require('./src/routes/clickRoutes');
const tryonRoutes = require('./src/routes/tryonRoutes');

const app = express();

app.set('trust proxy', 1); // behind Render's proxy, so rate limits see the real visitor IP
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// In production set CORS_ORIGIN to your website address (comma-separated for several).
const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : {}));
app.use(express.json({ limit: '100kb' }));

const limiter = (limit, windowMs) => rateLimit({
  windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a few minutes and try again.' },
});
// Limits are per visitor IP and generous enough for a classroom sharing one network.
app.use('/api/auth', limiter(100, 15 * 60 * 1000));
app.use('/api/profile/upload-images', limiter(60, 60 * 60 * 1000));
app.use('/api/tryon', limiter(40, 60 * 60 * 1000));

app.get('/', (req, res) => res.send('FitCheck backend is running!'));
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/closet', closetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/click', clickRoutes);
app.use('/api/tryon', tryonRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
  res.status(status).json({ message: status === 413 ? 'That image is too large (8 MB max).' : 'Unexpected server error.' });
});

module.exports = app;
