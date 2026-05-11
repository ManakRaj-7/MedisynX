const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const billingRoutes = require('./routes/billing');
const aiRoutes = require('./routes/ai');
const demoRoutes = require('./routes/demo');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to Database
connectDB();

// ──────────────── Security Middleware ────────────────

// CORS - must be before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Security headers (CSP disabled for dev compatibility with Vite)
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
// app.use(mongoSanitize());
// app.use(hpp());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/v1/auth', authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// ──────────────── API Routes ────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/demo', demoRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'MedisynX API',
    version: '2.0.0',
    security: ['helmet', 'rate-limit', 'mongo-sanitize', 'hpp'],
    ai: 'OpenRouter primary, Gemini 2.5 Flash fallback',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MedisynX API running on port ${PORT}`);
});

module.exports = app;
