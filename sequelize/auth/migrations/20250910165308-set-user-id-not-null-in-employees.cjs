'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employees', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('employees', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true, // Volver a permitir null en caso de rollback
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  }
};
