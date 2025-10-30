import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, 
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  }, {
    tableName: 'clients',
    underscored: true,
    timestamps: false, 
  });
