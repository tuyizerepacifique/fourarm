const { Contribution, User } = require('../models');

const createContribution = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;

    console.log('Creating contribution with data:', {
      amount,
      paymentMethod,
      transactionId,
      notes,
      userId: req.user.id
    });

    // Validate required fields
    if (!amount || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Amount and payment method are required.' 
      });
    }

    const contribution = await Contribution.create({
      amount: parseFloat(amount),
      paymentMethod,
      transactionId: transactionId || null,
      notes: notes || null,
      userId: req.user.id,
      status: 'pending'
    });

    console.log('Contribution created successfully:', contribution.toJSON());

    res.status(201).json({
      message: 'Contribution submitted successfully. Waiting for admin approval.',
      contribution
    });
  } catch (error) {
    console.error('Create contribution error:', error);
    
    // Provide more specific error messages
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Transaction ID must be unique' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error creating contribution.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getContributions = async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };
    
    const contributions = await Contribution.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email'],
        as: 'user'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ contributions });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ message: 'Server error fetching contributions.' });
  }
};

const getUserContributions = async (req, res) => {
  try {
    const contributions = await Contribution.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email'],
        as: 'user'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ contributions });
  } catch (error) {
    console.error('Get user contributions error:', error);
    res.status(500).json({ message: 'Server error fetching user contributions.' });
  }
};

const updateContributionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    // FIXED: Include user data when finding the contribution
    const contribution = await Contribution.findByPk(id, {
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email'],
        as: 'user'
      }]
    });
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found.' });
    }

    // Update the status and ensure it's saved to database
    contribution.status = status;
    await contribution.save();

    // FIXED: Return the updated contribution with user data
    res.json({
      message: `Contribution ${status} successfully.`,
      contribution
    });
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({ message: 'Server error updating contribution.' });
  }
};

const deleteContribution = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findByPk(id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found.' });
    }

    // Only allow deletion if user owns the contribution or is admin
    if (contribution.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this contribution.' });
    }

    await contribution.destroy();

    res.json({ message: 'Contribution deleted successfully.' });
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({ message: 'Server error deleting contribution.' });
  }
};

module.exports = {
  createContribution,
  getContributions,
  getUserContributions,
  updateContributionStatus,
  deleteContribution
};