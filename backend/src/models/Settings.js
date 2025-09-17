const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
  // REMOVED the explicit createdAt and updatedAt definitions
  // Let Sequelize handle them automatically or use the database defaults
}, {
  tableName: 'settings',
  timestamps: true, // This enables Sequelize to automatically manage createdAt and updatedAt
  underscored: false, // CHANGE to false since your SQL uses camelCase
  indexes: [
    {
      unique: true,
      fields: ['key']
    }
  ]
});

// Add class methods
Settings.findByKey = function(key) {
  return this.findOne({ where: { key } });
};

Settings.updateByKey = function(key, value, description = null) {
  return this.upsert({
    key,
    value,
    description: description || `Setting for ${key}`
    // REMOVED explicit updatedAt - let database handle it
  }, {
    where: { key }
  });
};

module.exports = Settings;