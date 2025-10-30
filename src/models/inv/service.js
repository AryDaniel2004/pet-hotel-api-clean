import { DataTypes, Model } from 'sequelize';
export default (sequelize) => {
  class Service extends Model {}
  Service.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    price_type: { type: DataTypes.ENUM('FIXED','PER_NIGHT'), defaultValue: 'FIXED' },
    price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  }, { sequelize, tableName: 'services', underscored: true });
  return Service;
};
