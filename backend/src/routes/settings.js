const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Settings, User } = require('../models');

const router = express.Router();

// Get all settings (admin only) - RETURN OBJECT FORMAT
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Settings request received from user:', req.user.id, 'role:', req.user.role);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin privileges required.' 
      });
    }

    const settings = await Settings.findAll({ 
      order: [['key', 'ASC']],
      raw: true // Get plain objects
    });
    
    if (!settings || settings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No settings found'
      });
    }

    // Convert array to object format for frontend
    const formattedSettings = {};
    settings.forEach(setting => {
      formattedSettings[setting.key] = {
        value: setting.value,
        description: setting.description,
        id: setting.id
      };
    });

    res.json({
      success: true,
      settings: formattedSettings, // Return object instead of array
      count: settings.length
    });
  } catch (error) {
    console.error('❌ Settings fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Special endpoint to update next meeting details
router.patch('/next-meeting', authenticate, async (req, res) => {
  try {
    console.log('Next meeting update request:', req.body);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin privileges required.' 
      });
    }

    const { title, date, time, location, agenda } = req.body;

    // Simple updates
    if (title !== undefined) {
      await Settings.update({ value: title }, { where: { key: 'nextMeetingTitle' } });
    }
    if (date !== undefined) {
      await Settings.update({ value: date }, { where: { key: 'nextMeetingDate' } });
    }
    if (time !== undefined) {
      await Settings.update({ value: time }, { where: { key: 'nextMeetingTime' } });
    }
    if (location !== undefined) {
      await Settings.update({ value: location }, { where: { key: 'nextMeetingLocation' } });
    }
    if (agenda !== undefined) {
      await Settings.update({ value: agenda }, { where: { key: 'nextMeetingAgenda' } });
    }

    res.json({
      success: true,
      message: 'Meeting settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Meeting settings update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update meeting settings'
    });
  }
});

// Get notification preferences
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Try to get preferences from user settings
    let preferences = user.notificationPreferences;
    
    if (!preferences) {
      // Return default preferences if none exist
      preferences = {
        emailNotifications: true,
        pushNotifications: false,
        contributionReminders: true,
        meetingReminders: true,
        monthlyReports: true
      };
    }

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Notification preferences error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notification preferences'
    });
  }
});

// Update notification preferences
router.put('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user notification preferences
    await user.update({ notificationPreferences: preferences });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update notification preferences'
    });
  }
});

// Get a specific setting by key
router.get('/:key', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch setting'
    });
  }
});

// Update a setting (admin only)
router.put('/:key', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    // Update the setting
    setting.value = value;
    if (description !== undefined) {
      setting.description = description;
    }
    
    await setting.save();

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update setting'
    });
  }
});

// Create a new setting (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const { key, value, description } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        error: 'Key and value are required'
      });
    }

    const existingSetting = await Settings.findOne({ where: { key } });
    
    if (existingSetting) {
      return res.status(409).json({
        success: false,
        error: 'Setting with this key already exists'
      });
    }

    const setting = await Settings.create({
      key,
      value,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    console.error('Settings create error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create setting'
    });
  }
});

// Delete a setting (admin only)
router.delete('/:key', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const { key } = req.params;

    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    const essentialSettings = ['nextMeetingTitle', 'nextMeetingDate', 'nextMeetingTime', 
                              'nextMeetingLocation', 'monthlyContribution', 'familyName'];
    if (essentialSettings.includes(key)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete essential settings'
      });
    }

    await Settings.destroy({ where: { key } });

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Settings delete error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete setting'
    });
  }
});

module.exports = router;