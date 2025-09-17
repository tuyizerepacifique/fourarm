const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'medium', 'high'),
    defaultValue: 'normal'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'announcements',
  timestamps: true
});

// Define associations
Announcement.associate = function(models) {
  Announcement.belongsTo(models.User, {
    foreignKey: 'authorId',
    as: 'author'
  });
};

module.exports = Announcement;