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

// Correct CORS origin from a single URL to a comma-separated list
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ UPDATED: Routes mounted without /api prefix
app.use('/auth', authRoutes);
app.use('/contributions', contributionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/settings', settingsRoutes);
app.use('/investments', investmentRoutes);
app.use('/announcements', announcementsRoutes);

// ✅ UPDATED: Health check without /api prefix
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ UPDATED: Root endpoint with corrected paths
app.get('/', (req, res) => {
  res.json({
    message: '4Arms Family Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      contributions: '/contributions',
      dashboard: '/dashboard',
      health: '/health',
      settings: '/settings',
      investments: '/investments',
      announcements: '/announcements',
      admin: '/admin'
    }
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', {
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
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
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
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
      console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`);
      console.log('\n📋 Available endpoints:');
      console.log('   Auth: /auth');
      console.log('   Contributions: /contributions');
      console.log('   Admin: /admin');
      console.log('   Dashboard: /dashboard');
      console.log('   Health: /health');
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