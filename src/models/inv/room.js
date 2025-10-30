import { DataTypes } from 'sequelize';
export default (sequelize) => sequelize.define('Room', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  code: { type: DataTypes.STRING, allowNull: false },
  room_type_id: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { tableName: 'rooms', underscored: true, timestamps: false });
