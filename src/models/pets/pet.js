import { DataTypes } from 'sequelize';

export default (sequelize) => sequelize.define('Pet', {
  id:         { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  owner_user_id: { type: DataTypes.UUID, allowNull: false },
  name:       { type: DataTypes.STRING, allowNull: false },
  species:    { type: DataTypes.STRING, allowNull: false }, 
  breed:      { type: DataTypes.STRING },
  weight_kg:  { type: DataTypes.DOUBLE, allowNull: false },
  photo_url:  { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { tableName: 'pets', underscored: true, timestamps: false });
