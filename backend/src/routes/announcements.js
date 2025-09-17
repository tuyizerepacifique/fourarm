const express = require('express');
const { Announcement, User } = require('../models');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new announcement (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      authorId: req.user.id
    });

    // Populate author information
    const populatedAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    await announcement.update(req.body);

    // Populate author information
    const populatedAnnouncement = await Announcement.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    await announcement.destroy();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete announcement',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update announcement visibility (admin only)
router.patch('/:id/visibility', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;
    
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    await announcement.update({ isVisible });

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement visibility',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;