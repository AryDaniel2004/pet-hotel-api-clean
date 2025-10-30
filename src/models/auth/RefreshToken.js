import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('RefreshToken', {
    id:         { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id:    { type: DataTypes.UUID, allowNull: false },
    token:      { type: DataTypes.STRING(500), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'refresh_tokens',
    underscored: true,
    timestamps: false,      
  });
};
