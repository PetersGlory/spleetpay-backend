const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SpleetPay API Documentation',
      version: '1.0.0',
      description: 'API documentation for the SpleetPay payment platform supporting Pay-for-Me and Group Split payments',
    },
    servers: [
      {
        url: 'http://localhost:4500/api',
        description: 'Development server',
      },
      {
        url: "https://spleetpay-backend.onrender.com/api",
        description: "Production Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;