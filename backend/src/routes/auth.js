const express = require('express');

// Create router immediately
const myAuthRouter = express.Router();

// Import after creating router to avoid any timing issues
const { 
  register, 
  login, 
  getProfile, 
  verifyToken,
  checkAdminEmail,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');

// Define routes
myAuthRouter.post('/register', register);
myAuthRouter.post('/login', login);
myAuthRouter.get('/profile', authenticate, getProfile);
myAuthRouter.put('/profile', authenticate, updateProfile);
myAuthRouter.post('/change-password', authenticate, changePassword);
myAuthRouter.get('/verify', authenticate, verifyToken);
myAuthRouter.post('/check-admin', checkAdminEmail);

module.exports = myAuthRouter;