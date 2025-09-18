const { Sequelize } = require('sequelize');

// Determine database dialect based on environment
const dialect = process.env.DB_DIALECT || 'postgresql';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Use DATABASE_URL if provided (recommended for production)
  sequelize = new Sequelize(databaseUrl, {
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: dialect === 'postgresql' ? {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    } : {}
  });
} else {
  // Fallback to individual environment variables
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: dialect === 'postgresql' ? {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    } : {}
  });
}

module.exports = sequelize;