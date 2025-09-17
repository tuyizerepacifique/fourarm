const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,         // e.g., fourarm_db
  process.env.DB_USER,         // e.g., admin
  process.env.DB_PASSWORD,     // e.g., SuperSecure123!
  {
    host: process.env.DB_HOST, // e.g., dpg-d35il4ali9vc738l5kh0-a
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',       // PostgreSQL for Render
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
