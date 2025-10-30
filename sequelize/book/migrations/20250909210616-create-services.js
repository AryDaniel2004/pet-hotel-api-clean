export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('services', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING },
    price_type: { type: Sequelize.ENUM('FIXED','PER_NIGHT'), defaultValue: 'FIXED' },
    price: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('services');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_services_price_type";');
}


