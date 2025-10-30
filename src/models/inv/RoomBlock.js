import { DataTypes } from 'sequelize';
export default (sequelize) => sequelize.define('RoomBlock', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  room_id: { type: DataTypes.UUID, allowNull: false },
  start: { type: DataTypes.DATE, allowNull: false },
  end: { type: DataTypes.DATE, allowNull: false },
  reason: { type: DataTypes.STRING(200) },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { tableName: 'room_blocks', underscored: true, timestamps: false });
