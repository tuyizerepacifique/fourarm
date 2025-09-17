const express = require('express');

// Create the router FIRST
const authRoutes = express.Router();

// Import using require() instead of destructuring to avoid any issues
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Verify the functions exist before using them
console.log('register function:', typeof authController.register);
console.log('updateProfile function:', typeof authController.updateProfile);
console.log('changePassword function:', typeof authController.changePassword);
console.log('authenticate middleware:', typeof authMiddleware.authenticate);

// Define all routes using the FULL path to functions
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.get('/profile', authMiddleware.authenticate, authController.getProfile);
authRoutes.put('/profile', authMiddleware.authenticate, authController.updateProfile);
authRoutes.post('/change-password', authMiddleware.authenticate, authController.changePassword);
authRoutes.get('/verify', authMiddleware.authenticate, authController.verifyToken);
authRoutes.post('/check-admin', authController.checkAdminEmail);

module.exports = authRoutes;