// src/models/User.js
import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      full_name: { type: DataTypes.STRING, allowNull: false },
      dpi: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("ADMIN", "CUSTOMER"),
        allowNull: false,
        defaultValue: "CUSTOMER",
      },
      created_at: { type: DataTypes.DATE },
      updated_at: { type: DataTypes.DATE },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: false,
    }
  );
