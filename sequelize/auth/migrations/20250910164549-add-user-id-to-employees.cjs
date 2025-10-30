'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'user_id', {
  type: Sequelize.UUID,
  allowNull: true, 
  references: {
    model: 'users',
    key: 'id'
  },
  onDelete: 'CASCADE'
});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('employees', 'user_id');
  }
};
