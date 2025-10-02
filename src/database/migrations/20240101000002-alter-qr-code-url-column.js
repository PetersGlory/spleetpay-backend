'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payment_requests', 'qr_code_url', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payment_requests', 'qr_code_url', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  }
};
