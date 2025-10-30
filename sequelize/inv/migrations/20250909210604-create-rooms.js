export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('rooms', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
    code: { type: Sequelize.STRING, allowNull: false, unique: true },
    room_type_id: { type: Sequelize.UUID, allowNull: false },
    status: { type: Sequelize.ENUM('ACTIVE','MAINT','BLOCKED'), defaultValue: 'ACTIVE' },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
  });
  await queryInterface.addIndex('rooms', ['room_type_id']);
}
export async function down(queryInterface) {
  await queryInterface.dropTable('rooms');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rooms_status";');
}
