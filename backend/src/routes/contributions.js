const express = require('express');
const { 
  createContribution, 
  getContributions, 
  getUserContributions, 
  updateContributionStatus,
  deleteContribution
} = require('../controllers/contributionController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new contribution (authenticated users only)
router.post('/', createContribution);

// Get all contributions (admin only) or user's own contributions
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') {
    // Admin gets all contributions
    getContributions(req, res, next);
  } else {
    // Regular users get their own contributions
    getUserContributions(req, res, next);
  }
});

// Get user's own contributions (explicit endpoint)
router.get('/my', getUserContributions);

// Update contribution status (admin only)
router.patch('/:id/status', authorizeAdmin, updateContributionStatus);

// Delete contribution (admin or owner)
router.delete('/:id', deleteContribution);

module.exports = router;