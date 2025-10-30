'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('employees', 'hire_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('employees', 'hire_date');
  }
};
