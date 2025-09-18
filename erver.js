[1mdiff --git a/backend/src/server.js b/backend/src/server.js[m
[1mindex 4f1f0cc..ce2cf53 100644[m
[1m--- a/backend/src/server.js[m
[1m+++ b/backend/src/server.js[m
[36m@@ -1,5 +1,3 @@[m
[31m-// server.js[m
[31m-[m
 const path = require('path');[m
 require('dotenv').config({ path: path.resolve(__dirname, '../.env') });[m
 [m
[36m@@ -26,139 +24,147 @@[m [mconst app = express();[m
 const PORT = process.env.PORT || 5000;[m
 [m
 // Correct CORS origin from a single URL to a comma-separated list[m
[31m-const allowedOrigins = process.env.FRONTEND_URL.split(',');[m
[32m+[m[32mconst allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];[m
 [m
 // Middleware[m
 app.use(cors({[m
[31m-  origin: (origin, callback) => {[m
[31m-    // allow requests with no origin (like mobile apps or curl requests)[m
[31m-    if (!origin) return callback(null, true);[m
[31m-    if (allowedOrigins.indexOf(origin) === -1) {[m
[31m-      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;[m
[31m-      return callback(new Error(msg), false);[m
[31m-    }[m
[31m-    return callback(null, true);[m
[31m-  },[m
[31m-  credentials: true[m
[32m+[m[32m  origin: (origin, callback) => {[m
[32m+[m[32m    // allow requests with no origin (like mobile apps or curl requests)[m
[32m+[m[32m    if (!origin) return callback(null, true);[m
[32m+[m[32m    if (allowedOrigins.indexOf(origin) === -1) {[m
[32m+[m[32m      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;[m
[32m+[m[32m      return callback(new Error(msg), false);[m
[32m+[m[32m    }[m
[32m+[m[32m    return callback(null, true);[m
[32m+[m[32m  },[m
[32m+[m[32m  credentials: true[m
 }));[m
 app.use(express.json({ limit: '10mb' }));[m
 [m
 // Logging middleware[m
 app.use((req, res, next) => {[m
[31m-  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);[m
[31m-  next();[m
[32m+[m[32m  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);[m
[32m+[m[32m  next();[m
 });[m
 [m
[31m-// Routes[m
[31m-app.use('/api/auth', authRoutes);[m
[31m-app.use('/api/contributions', contributionRoutes);[m
[31m-app.use('/api/dashboard', dashboardRoutes);[m
[31m-app.use('/api/admin', adminRoutes);[m
[31m-app.use('/api/settings', settingsRoutes);[m
[31m-app.use('/api/investments', investmentRoutes);[m
[31m-app.use('/api/announcements', announcementsRoutes);[m
[31m-[m
[31m-// Health check[m
[31m-app.get('/api/health', async (req, res) => {[m
[31m-  try {[m
[31m-    await sequelize.authenticate();[m
[31m-    res.json({ [m
[31m-      status: 'OK',[m
[31m-      timestamp: new Date().toISOString(),[m
[31m-      environment: process.env.NODE_ENV || 'development',[m
[31m-      database: 'connected'[m
[31m-    });[m
[31m-  } catch (error) {[m
[31m-    res.status(500).json({[m
[31m-      status: 'ERROR',[m
[31m-      error: 'Database connection failed',[m
[31m-      details: process.env.NODE_ENV === 'development' ? error.message : undefined[m
[31m-    });[m
[31m-  }[m
[32m+[m[32m// ✅ UPDATED: Routes mounted without /api prefix[m
[32m+[m[32mapp.use('/auth', authRoutes);[m
[32m+[m[32mapp.use('/contributions', contributionRoutes);[m
[32m+[m[32mapp.use('/dashboard', dashboardRoutes);[m
[32m+[m[32mapp.use('/admin', adminRoutes);[m
[32m+[m[32mapp.use('/settings', settingsRoutes);[m
[32m+[m[32mapp.use('/investments', investmentRoutes);[m
[32m+[m[32mapp.use('/announcements', announcementsRoutes);[m
[32m+[m
[32m+[m[32m// ✅ UPDATED: Health check without /api prefix[m
[32m+[m[32mapp.get('/health', async (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    await sequelize.authenticate();[m
[32m+[m[32m    res.json({[m[41m [m
[32m+[m[32m      status: 'OK',[m
[32m+[m[32m      timestamp: new Date().toISOString(),[m
[32m+[m[32m      environment: process.env.NODE_ENV || 'development',[m
[32m+[m[32m      database: 'connected'[m
[32m+[m[32m    });[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({[m
[32m+[m[32m      status: 'ERROR',[m
[32m+[m[32m      error: 'Database connection failed',[m
[32m+[m[32m      details: process.env.NODE_ENV === 'development' ? error.message : undefined[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
 });[m
 [m
[31m-// Root endpoint[m
[32m+[m[32m// ✅ UPDATED: Root endpoint with corrected paths[m
 app.get('/', (req, res) => {[m
[31m-  res.json({[m
[31m-    message: '4Arms Family Backend API',[m
[31m-    version: '1.0.0',[m
[31m-    endpoints: {[m
[31m-      auth: '/api/auth',[m
[31m-      contributions: '/api/contributions',[m
[31m-      dashboard: '/api/dashboard',[m
[31m-      health: '/api/health',[m
[31m-      settings: '/api/settings',[m
[31m-      investments: '/api/investments'[m
[31m-    }[m
[31m-  });[m
[32m+[m[32m  res.json({[m
[32m+[m[32m    message: '4Arms Family Backend API',[m
[32m+[m[32m    version: '1.0.0',[m
[32m+[m[32m    endpoints: {[m
[32m+[m[32m      auth: '/auth',[m
[32m+[m[32m      contributions: '/contributions',[m
[32m+[m[32m      dashboard: '/dashboard',[m
[32m+[m[32m      health: '/health',[m
[32m+[m[32m      settings: '/settings',[m
[32m+[m[32m      investments: '/investments',[m
[32m+[m[32m      announcements: '/announcements',[m
[32m+[m[32m      admin: '/admin'[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
 });[m
 [m
 // Error logging middleware[m
 app.use((err, req, res, next) => {[m
[31m-  console.error('❌ ERROR:', {[m
[31m-    timestamp: new Date().toISOString(),[m
[31m-    method: req.method,[m
[31m-    path: req.path,[m
[31m-    error: err.message,[m
[31m-    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined[m
[31m-  });[m
[31m-  next(err);[m
[32m+[m[32m  console.error('❌ ERROR:', {[m
[32m+[m[32m    timestamp: new Date().toISOString(),[m
[32m+[m[32m    method: req.method,[m
[32m+[m[32m    path: req.path,[m
[32m+[m[32m    error: err.message,[m
[32m+[m[32m    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined[m
[32m+[m[32m  });[m
[32m+[m[32m  next(err);[m
 });[m
 [m
 // Final error handler[m
 app.use((err, req, res, next) => {[m
[31m-  res.status(500).json({[m
[31m-    error: 'Something went wrong!',[m
[31m-    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'[m
[31m-  });[m
[32m+[m[32m  res.status(500).json({[m
[32m+[m[32m    error: 'Something went wrong!',[m
[32m+[m[32m    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'[m
[32m+[m[32m  });[m
 });[m
 [m
 // 404 handler[m
 app.use((req, res) => {[m
[31m-  res.status(404).json({[m
[31m-    error: 'Endpoint not found',[m
[31m-    path: req.path,[m
[31m-    method: req.method[m
[31m-  });[m
[32m+[m[32m  res.status(404).json({[m
[32m+[m[32m    error: 'Endpoint not found',[m
[32m+[m[32m    path: req.path,[m
[32m+[m[32m    method: req.method[m
[32m+[m[32m  });[m
 });[m
 [m
 process.on('unhandledRejection', (reason, promise) => {[m
[31m-  console.error('Unhandled Rejection at:', promise, 'reason:', reason);[m
[32m+[m[32m  console.error('Unhandled Rejection at:', promise, 'reason:', reason);[m
 });[m
 [m
 process.on('uncaughtException', (error) => {[m
[31m-  console.error('Uncaught Exception:', error);[m
[31m-  process.exit(1);[m
[32m+[m[32m  console.error('Uncaught Exception:', error);[m
[32m+[m[32m  process.exit(1);[m
 });[m
 [m
 // Start server[m
 const startServer = async () => {[m
[31m-  try {[m
[31m-    console.log('🔄 Syncing database...');[m
[31m-    await syncDatabase();[m
[31m-    console.log('✅ Database synchronized successfully');[m
[31m-[m
[31m-    const server = app.listen(PORT, () => {[m
[31m-      console.log(`🚀 Server is running on port ${PORT}`);[m
[31m-      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);[m
[31m-      console.log(`📊 Database: ${process.env.DB_NAME}`);[m
[31m-      console.log(`🔗 Health: http://localhost:${PORT}/api/health`);[m
[31m-      console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`);[m
[31m-    });[m
[31m-[m
[31m-    process.on('SIGINT', () => {[m
[31m-      console.log('\n🛑 Shutting down server gracefully...');[m
[31m-      server.close(() => {[m
[31m-        console.log('✅ Server closed');[m
[31m-        process.exit(0);[m
[31m-      });[m
[31m-    });[m
[31m-[m
[31m-  } catch (error) {[m
[31m-    console.error('❌ Failed to start server:', error.message);[m
[31m-    console.error('Error details:', error);[m
[31m-    process.exit(1);[m
[31m-  }[m
[32m+[m[32m  try {[m
[32m+[m[32m    console.log('🔄 Syncing database...');[m
[32m+[m[32m    await syncDatabase();[m
[32m+[m[32m    console.log('✅ Database synchronized successfully');[m
[32m+[m
[32m+[m[32m    const server = app.listen(PORT, () => {[m
[32m+[m[32m      console.log(`🚀 Server is running on port ${PORT}`);[m
[32m+[m[32m      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);[m
[32m+[m[32m      console.log(`📊 Database: ${process.env.DB_NAME}`);[m
[32m+[m[32m      console.log(`🔗 Health: http://localhost:${PORT}/health`);[m
[32m+[m[32m      console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`);[m
[32m+[m[32m      console.log('\n📋 Available endpoints:');[m
[32m+[m[32m      console.log('   Auth: /auth');[m
[32m+[m[32m      console.log('   Contributions: /contributions');[m
[32m+[m[32m      console.log('   Admin: /admin');[m
[32m+[m[32m      console.log('   Dashboard: /dashboard');[m
[32m+[m[32m      console.log('   Health: /health');[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    process.on('SIGINT', () => {[m
[32m+[m[32m      console.log('\n🛑 Shutting down server gracefully...');[m
[32m+[m[32m      server.close(() => {[m
[32m+[m[32m        console.log('✅ Server closed');[m
[32m+[m[32m        process.exit(0);[m
[32m+[m[32m      });[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    console.error('❌ Failed to start server:', error.message);[m
[32m+[m[32m    console.error('Error details:', error);[m
[32m+[m[32m    process.exit(1);[m
[32m+[m[32m  }[m
 };[m
 [m
 startServer();[m
