const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== UPDATED CORS CONFIGURATION ==========
// Allow all origins for production (temporary fix)
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/documents', documentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    environment: process.env.NODE_ENV
  });
});

// Root route - prevents 404 at root
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Family Vault API is running',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      members: '/api/members',
      documents: '/api/documents'
    }
  });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;