const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');
const farmerAuthRoutes = require('./src/routes/farmerAuthRoutes');
const farmerProductRequestRoutes = require('./src/routes/farmerProductRequestRoutes');
const farmerProductRoutes = require('./src/routes/farmerProductRoutes');
const farmerRecommendationRoutes = require('./src/routes/farmerRecommendationRoutes');
const adminProductRequestRoutes = require('./src/routes/adminProductRequestRoutes');
const adminFarmerRoutes = require('./src/routes/adminFarmerRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Behind Render's proxy — needed for express-rate-limit and req.ip
app.set('trust proxy', 1);

// Security headers (cross-origin so Cloudinary images load fine)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// gzip/deflate compression for all responses
app.use(compression());

// CORS — env-driven allow-list in production, permissive for localhost in dev
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    // Non-browser clients (curl, health checks) send no Origin
    if (!origin) return cb(null, true);
    // Local dev: allow any localhost / 127.0.0.1 port
    if (!isProduction && localhostRegex.test(origin)) return cb(null, true);
    // Allow-list match (works in both dev and prod)
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Production with no allow-list configured = block (safe default)
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/farmer/auth', farmerAuthRoutes);
app.use('/api/farmer/product-requests', farmerProductRequestRoutes);
app.use('/api/farmer/products', farmerProductRoutes);
app.use('/api/farmer/recommendations', farmerRecommendationRoutes);
app.use('/api/admin/product-requests', adminProductRequestRoutes);
app.use('/api/admin/farmers', adminFarmerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MONGODB connected successfully...');
  })
  .catch((err) => {
    console.error('MONGODB connection error:', err.message, '...');
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode...`);
});

module.exports = app;
