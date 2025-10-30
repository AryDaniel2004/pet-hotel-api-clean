"use strict";

/**
 * Agrega la columna `notes` a la tabla `bookings`
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Notas o comentarios adicionales de la reserva",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("bookings", "notes");
  },
};
