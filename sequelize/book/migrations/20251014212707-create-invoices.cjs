'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      booking_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false }, // cliente (users.id)
      payment_id: { type: Sequelize.UUID, allowNull: true }, // payments.id
      issue_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      due_date: { type: Sequelize.DATE, allowNull: true },
      subtotal: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      taxes: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.ENUM('ISSUED','VOID'), allowNull: false, defaultValue: 'ISSUED' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('invoice_items', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      invoice_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'invoices', key: 'id' }, onDelete: 'CASCADE'
      },
      description: { type: Sequelize.STRING, allowNull: false },
      qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoice_items');
    await queryInterface.dropTable('invoices');
  }
};
