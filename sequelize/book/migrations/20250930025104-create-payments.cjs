'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      booking_id: { type: Sequelize.UUID, allowNull: false },
      provider: { type: Sequelize.STRING, allowNull: false, defaultValue: 'STRIPE' },
      provider_ref: { type: Sequelize.STRING, allowNull: true }, 
      status: { type: Sequelize.ENUM('PENDING','PAID','FAILED','CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
      amount: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: 'USD' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
    await queryInterface.addIndex('payments', ['booking_id']);
    await queryInterface.addIndex('payments', ['provider_ref']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
