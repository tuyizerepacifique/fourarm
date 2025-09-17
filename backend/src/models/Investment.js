const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ✅ Imports the instance directly

const Investment = sequelize.define('Investment', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('real_estate', 'stocks', 'small_business', 'fixed_income', 'forex', 'other'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  amountInvested: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currentValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  expectedReturnRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  roi: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  riskLevel: {
    type: DataTypes.ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'matured', 'under_performance'),
    defaultValue: 'active'
  },
  description: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (investment) => {
      // Set currentValue to amountInvested initially
      if (!investment.currentValue || investment.currentValue === 0) {
        investment.currentValue = investment.amountInvested;
      }
      // Calculate initial ROI (0%)
      investment.roi = 0;
    },
    beforeUpdate: (investment) => {
      // Auto-calculate ROI when currentValue changes
      if (investment.changed('currentValue') && investment.amountInvested > 0) {
        const gain = investment.currentValue - investment.amountInvested;
        investment.roi = (gain / investment.amountInvested) * 100;
      }
    }
  }
});

module.exports = Investment;