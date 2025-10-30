export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await queryInterface.createTable('booking_services', {
    id: { 
      type: Sequelize.UUID, 
      defaultValue: Sequelize.literal('uuid_generate_v4()'), 
      primaryKey: true 
    },
    booking_item_id: { type: Sequelize.UUID, allowNull: false }, 
    service_id: { type: Sequelize.UUID, allowNull: false },      
    qty: { type: Sequelize.INTEGER, defaultValue: 1 },
    unit_price: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
  });

  await queryInterface.addIndex('booking_services', ['booking_item_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('booking_services');
}
