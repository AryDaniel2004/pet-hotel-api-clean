export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await queryInterface.createTable('bookings', {
    id: { 
      type: Sequelize.UUID, 
      defaultValue: Sequelize.literal('uuid_generate_v4()'), 
      primaryKey: true 
    },
    customer_user_id: { type: Sequelize.UUID, allowNull: false },
    start_date: { type: Sequelize.DATEONLY, allowNull: false },
    end_date: { type: Sequelize.DATEONLY, allowNull: false },
    status: { 
      type: Sequelize.ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED'), 
      defaultValue: 'PENDING' 
    },
    subtotal: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    taxes: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    total: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
  });

  await queryInterface.addIndex('bookings', ['customer_user_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('bookings');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bookings_status";');
}
