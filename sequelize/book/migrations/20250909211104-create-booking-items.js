export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await queryInterface.createTable('booking_items', {
    id: { 
      type: Sequelize.UUID, 
      defaultValue: Sequelize.literal('uuid_generate_v4()'), 
      primaryKey: true 
    },
    booking_id: { type: Sequelize.UUID, allowNull: false }, 
    pet_id: { type: Sequelize.UUID, allowNull: false },    
    room_id: { type: Sequelize.UUID, allowNull: false },    
    nightly_rate: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    notes: { type: Sequelize.STRING },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
  });

  await queryInterface.addIndex('booking_items', ['booking_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('booking_items');
}
