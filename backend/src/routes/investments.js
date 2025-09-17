const express = require('express');
const { Investment, User, Contribution, Settings } = require('../models');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Debug: Check if Investment model is properly imported
console.log('Investment model:', typeof Investment);
console.log('Investment.findAll:', typeof Investment?.findAll);

// Get all investments
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching investments...');
    
    // Check if Investment model is available
    if (!Investment || typeof Investment.findAll !== 'function') {
      throw new Error('Investment model is not properly initialized');
    }
    
    const investments = await Investment.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    console.log('Found investments:', investments.length);
    
    res.json({
      success: true,
      investments
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investments',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get investment statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Check if Investment model is available
    if (!Investment || typeof Investment.findAll !== 'function') {
      throw new Error('Investment model is not properly initialized');
    }
    
    // Get all investments
    const investments = await Investment.findAll();
    
    // Get max investment percentage from settings or use default 83%
    const maxPercentageSetting = await Settings.findOne({ 
      where: { key: 'maxInvestmentPercentage' } 
    });
    const maxPercentage = maxPercentageSetting ? parseFloat(maxPercentageSetting.value) : 83;
    
    // Calculate total approved contributions
    const totalContributions = await Contribution.sum('amount', {
      where: { status: 'completed' }
    }) || 0;
    
    // Calculate investment cap (maxPercentage% of total contributions)
    const investmentCap = totalContributions * (maxPercentage / 100);
    const emergencyFund = totalContributions * ((100 - maxPercentage) / 100);
    
    // Filter active investments
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    
    // Calculate investment statistics
    const totalValue = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.currentValue || 0), 0);
    const totalInvested = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.amountInvested || 0), 0);
    
    // Calculate ACTUAL ROI based on real performance
    const totalGain = totalValue - totalInvested;
    const actualROI = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    // Calculate EXPECTED return (weighted average of expected return rates)
    let expectedReturnSum = 0;
    let totalWeight = 0;
    
    activeInvestments.forEach(inv => {
      const weight = parseFloat(inv.amountInvested || 0) / totalInvested;
      expectedReturnSum += weight * parseFloat(inv.expectedReturnRate || 0);
      totalWeight += weight;
    });
    
    const expectedReturn = totalWeight > 0 ? expectedReturnSum / totalWeight : 0;

    res.json({
      success: true,
      stats: {
        totalValue,
        totalInvested,
        actualROI,           // Actual performance based on current value
        expectedReturn,      // Expected/target return based on investment projections
        annualReturn: expectedReturn, // For backward compatibility (shows expected return)
        activeInvestments: activeInvestments.length,
        totalContributions,
        investmentCap,
        emergencyFund
      }
    });
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investment statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new investment (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Check if Investment model is available
    if (!Investment || typeof Investment.create !== 'function') {
      throw new Error('Investment model is not properly initialized');
    }
    
    // Get max investment percentage from settings or use default 83%
    const maxPercentageSetting = await Settings.findOne({ 
      where: { key: 'maxInvestmentPercentage' } 
    });
    const maxPercentage = maxPercentageSetting ? parseFloat(maxPercentageSetting.value) : 83;
    
    // Calculate total approved contributions
    const totalContributions = await Contribution.sum('amount', {
      where: { status: 'completed' }
    }) || 0;
    
    // Get all current investments to calculate total already invested
    const existingInvestments = await Investment.findAll();
    const totalAlreadyInvested = existingInvestments.reduce((sum, inv) => 
      sum + parseFloat(inv.amountInvested || 0), 0);
    
    // Validate investment amount doesn't exceed the max percentage of total contributions
    const investmentAmount = parseFloat(req.body.amountInvested);
    const maxAllowed = totalContributions * (maxPercentage / 100);
    const remainingCapacity = maxAllowed - totalAlreadyInvested;
    
    if (investmentAmount > remainingCapacity) {
      return res.status(400).json({
        success: false,
        error: `Investment amount (${investmentAmount}) exceeds available capacity. Only ${remainingCapacity} remaining within the ${maxPercentage}% cap.`
      });
    }
    
    const investment = await Investment.create({
      ...req.body,
      createdBy: req.user.id,
      currentValue: req.body.amountInvested, // Set initial value
      roi: 0 // Start with 0% ROI
    });

    res.status(201).json({
      success: true,
      investment
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update an investment's currentValue (admin only)
router.put('/:id/currentValue', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue } = req.body;

    // Validate input
    if (typeof currentValue === 'undefined' || isNaN(parseFloat(currentValue))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing currentValue'
      });
    }

    const investment = await Investment.findByPk(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    // Update the currentValue field
    investment.currentValue = parseFloat(currentValue);
    await investment.save();

    // The 'beforeUpdate' hook in the model will automatically recalculate the ROI

    res.json({
      success: true,
      investment
    });

  } catch (error) {
    console.error('Error updating investment currentValue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update investment value',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get specific investment
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Check if Investment model is available
    if (!Investment || typeof Investment.findByPk !== 'function') {
      throw new Error('Investment model is not properly initialized');
    }
    
    const investment = await Investment.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    res.json({
      success: true,
      investment
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update investment (general update endpoint)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findByPk(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    // Update the investment with the provided data
    await investment.update(req.body);

    res.json({
      success: true,
      investment
    });

  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update investment',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;