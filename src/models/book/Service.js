import { DataTypes } from 'sequelize';

export default (sequelize) => sequelize.define('Service', {
  id:          { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price_type:  { type: DataTypes.STRING, allowNull: true }, 
  price:       { type: DataTypes.DECIMAL, allowNull: true },
  created_at:  { type: DataTypes.DATE },
  updated_at:  { type: DataTypes.DATE },
}, { tableName: 'services', underscored: true, timestamps: false });
