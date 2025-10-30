import { DataTypes, Model } from 'sequelize';
export default (sequelize) => {
  class RoomType extends Model {}
  RoomType.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    min_weight: { type: DataTypes.FLOAT },
    max_weight: { type: DataTypes.FLOAT },
    allowed_species: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: ['DOG'] },
    features: { type: DataTypes.JSONB },
    base_rate: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  }, { sequelize, tableName: 'room_types', underscored: true });
  return RoomType;
};
