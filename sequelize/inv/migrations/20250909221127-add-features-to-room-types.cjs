'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('room_types');
    if (!table.features) {
      await queryInterface.addColumn('room_types', 'features', {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
        defaultValue: {} 
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('room_types');
    if (table.features) {
      await queryInterface.removeColumn('room_types', 'features');
    }
  }
};
