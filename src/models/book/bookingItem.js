// src/models/book/bookingItem.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const BookingItem = sequelize.define(
    "BookingItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Referencia a la reserva principal (Booking)",
      },
      pet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Mascota asociada a este item de la reserva",
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Habitación asignada",
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Cantidad (generalmente 1 por habitación)",
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Precio base de la habitación (por noche o estadía)",
      },
      nightly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Tarifa por noche (opcional)",
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "booking_items",
      underscored: true,
      timestamps: false,
    }
  );

  return BookingItem;
};
