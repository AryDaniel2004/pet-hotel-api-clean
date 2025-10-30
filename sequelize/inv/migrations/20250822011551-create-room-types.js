export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
  await queryInterface.createTable('room_types', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('uuid_generate_v4()'),
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    min_weight: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    max_weight: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    base_rate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    allowed_species: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: ['DOG'],
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('room_types');
}
