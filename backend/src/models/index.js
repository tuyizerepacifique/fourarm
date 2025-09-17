const sequelize = require('../config/database');
const User = require('./User');
const Contribution = require('./Contribution');
const Settings = require('./Settings');
const Investment = require('./Investment');
const Announcement = require('./Announcement');

// Define associations
User.hasMany(Contribution, { 
  foreignKey: 'userId', 
  as: 'contributions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Contribution.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Association between User and Investment
User.hasMany(Investment, {
  foreignKey: 'createdBy',
  as: 'investments',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Investment.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Association between User and Announcement
User.hasMany(Announcement, {
  foreignKey: 'authorId',
  as: 'announcements',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Announcement.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Use environment variable to control force sync
    const shouldForceSync = process.env.FORCE_SYNC === 'true';
    
    console.log(`🔄 Sync mode: ${shouldForceSync ? 'FORCE (drop & recreate)' : 'ALTER (modify existing)'}`);
    
    await sequelize.sync({ 
      force: shouldForceSync,
      alter: !shouldForceSync // Don't alter when forcing sync
    });
    
    console.log('✅ Database models synchronized successfully.');

    await createDefaultSettings();
    
    // If we forced sync, create a default admin user
    if (shouldForceSync) {
      await createDefaultAdmin();
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    // If sync fails with key error, try a more conservative approach
    if (error.original?.code === 'ER_TOO_MANY_KEYS') {
      console.log('🔄 Too many keys error detected. Trying safe sync...');
      await safeSync();
    } else {
      console.error('❌ Full error details:', error);
      throw error; // Re-throw for server to handle
    }
  }
};

// Safe sync method for key errors
const safeSync = async () => {
  try {
    // First try without alter
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database models synchronized (safe mode).');
  } catch (safeError) {
    console.error('❌ Safe sync also failed:', safeError.message);
    
    // If safe sync fails, try force sync as last resort
    console.log('🔄 Attempting force sync as last resort...');
    await sequelize.sync({ force: true, alter: false });
    console.log('✅ Database models synchronized (force mode).');
    
    // Recreate default data
    await createDefaultSettings();
    await createDefaultAdmin();
  }
};

const createDefaultSettings = async () => {
  try {
    const defaultSettings = [
      { key: 'nextMeetingTitle', value: '', description: 'Title of the next family meeting' },
      { key: 'nextMeetingDate', value: '', description: 'Date of the next family meeting' },
      { key: 'nextMeetingTime', value: '', description: 'Time of the next family meeting' },
      { key: 'nextMeetingLocation', value: '', description: 'Location of the next family meeting' },
      { key: 'nextMeetingAgenda', value: '', description: 'Agenda for the next family meeting' },
      { key: 'monthlyContribution', value: '0', description: 'Monthly contribution amount' },
      { key: 'familyName', value: 'Our Family', description: 'Family name' },
      { key: 'maxInvestmentPercentage', value: '83', description: 'Maximum percentage of contributions that can be invested' }
    ];

    for (const setting of defaultSettings) {
      const existingSetting = await Settings.findOne({ where: { key: setting.key } });
      if (!existingSetting) {
        await Settings.create(setting);
        console.log(`✅ Created default setting: ${setting.key}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating default settings:', error);
  }
};

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { email: 'admin@family.com' } });
    
    if (!existingAdmin) {
      await User.create({
        firstName: 'Family',
        lastName: 'Admin',
        email: 'admin@family.com',
        password: 'admin123', // Will be hashed by the hook
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Created default admin user: admin@family.com / admin123');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Contribution,
  Settings,
  Investment,
  Announcement,
  syncDatabase
};