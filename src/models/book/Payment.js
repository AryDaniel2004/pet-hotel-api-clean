import { DataTypes } from 'sequelize';
export default (sequelize) =>
  sequelize.define('Payment', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    booking_id: { type: DataTypes.UUID, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'STRIPE' },
    provider_ref: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('PENDING','PAID','FAILED','CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
    amount: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USD' },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  }, { tableName: 'payments', underscored: true, timestamps: false });
