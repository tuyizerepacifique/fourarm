// server.js - COMPLETE UPDATED VERSION WITH /api PREFIX

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5000);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('===========================');

const express = require('express');
const cors = require('cors');
const { syncDatabase, sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const contributionRoutes = require('./routes/contributions');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const investmentRoutes = require('./routes/investments');
const announcementsRoutes = require('./routes/announcements');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'https://frontend-hzf0mal3u-idiom.vercel.app',
  'https://fourarm-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://fourarm-frontend.vercel.app',
];

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',');
  allowedOrigins.push(...envOrigins);
}

console.log('🔄 Allowed CORS origins:', allowedOrigins);

// SIMPLE & EFFECTIVE CORS MIDDLEWARE
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// ✅ ROUTES MOUNTED WITH /api PREFIX (for frontend compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/announcements', announcementsRoutes);

// ✅ HEALTH CHECK ENDPOINT WITH /api PREFIX
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      cors: {
        allowedOrigins: allowedOrigins,
        currentOrigin: req.headers.origin || 'none'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ CORS TEST ENDPOINT WITH /api PREFIX
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// ✅ API TEST ENDPOINT WITH /api PREFIX
app.get('/api/api-test', (req, res) => {
  res.json({
    message: 'API test successful!',
    frontendBase: 'https://fourarm-backend.onrender.com/api',
    backendRoutes: '/api/auth, /api/contributions, /api/admin, etc.',
    note: 'Frontend should use: https://fourarm-backend.onrender.com/api + endpoint',
    example: 'https://fourarm-backend.onrender.com/api/auth/login'
  });
});

// ✅ ROOT ENDPOINT WITH UPDATED PATHS
app.get('/', (req, res) => {
  res.json({
    message: '4Arms Family Backend API - WITH API PREFIX',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: '🟢 RUNNING WITH API PREFIX',
    endpoints: {
      auth: '/api/auth',
      contributions: '/api/contributions',
      dashboard: '/api/dashboard',
      health: '/api/health',
      settings: '/api/settings',
      investments: '/api/investments',
      announcements: '/api/announcements',
      admin: '/api/admin',
      corsTest: '/api/cors-test',
      apiTest: '/api/api-test'
    },
    frontendUsage: {
      baseURL: 'https://fourarm-backend.onrender.com/api',
      examples: {
        login: 'https://fourarm-backend.onrender.com/api/auth/login',
        users: 'https://fourarm-backend.onrender.com/api/admin/users',
        contributions: 'https://fourarm-backend.onrender.com/api/contributions',
        health: 'https://fourarm-backend.onrender.com/api/health'
      }
    },
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || 'none',
      status: '✅ CONFIGURED'
    }
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    console.error('❌ CORS ERROR:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      error: err.message
    });
    
    return res.status(403).json({
      error: 'CORS blocked',
      message: 'Request origin not allowed',
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }
  
  console.error('❌ GENERAL ERROR:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  next(err);
});

// Final error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      auth: '/api/auth',
      contributions: '/api/contributions',
      dashboard: '/api/dashboard',
      health: '/api/health',
      settings: '/api/settings',
      admin: '/api/admin',
      corsTest: '/api/cors-test',
      apiTest: '/api/api-test'
    },
    frontendUsage: 'Use: https://fourarm-backend.onrender.com/api + endpoint'
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Syncing database...');
    await syncDatabase();
    console.log('✅ Database synchronized successfully');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log(`🔗 Health: https://fourarm-backend.onrender.com/api/health`);
      console.log(`🔗 CORS Test: https://fourarm-backend.onrender.com/api/cors-test`);
      console.log(`🔗 API Test: https://fourarm-backend.onrender.com/api/api-test`);
      console.log(`🎯 Allowed Frontends: ${allowedOrigins.join(', ')}`);
      console.log('\n📋 Available endpoints:');
      console.log('   Auth: /api/auth');
      console.log('   Contributions: /api/contributions');
      console.log('   Admin: /api/admin');
      console.log('   Dashboard: /api/dashboard');
      console.log('   Health: /api/health');
      console.log('   CORS Test: /api/cors-test');
      console.log('   API Test: /api/api-test');
      console.log('\n🎯 Frontend should use:');
      console.log('   Base URL: https://fourarm-backend.onrender.com/api');
      console.log('   Example: https://fourarm-backend.onrender.com/api/auth/login');
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;