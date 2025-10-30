// src/models/book/bookingService.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const BookingService = sequelize.define(
    "BookingService",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Referencia al BookingItem relacionado",
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Servicio contratado (ej. Grooming, Baño, etc.)",
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "booking_services",
      timestamps: false,
    }
  );

  return BookingService;
};
