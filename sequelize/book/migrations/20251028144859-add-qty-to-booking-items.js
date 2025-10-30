export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("booking_items", "qty", {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
  });

  await queryInterface.addColumn("booking_items", "unit_price", {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("booking_items", "qty");
  await queryInterface.removeColumn("booking_items", "unit_price");
}
