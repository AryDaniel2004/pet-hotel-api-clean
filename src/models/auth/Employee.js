import { DataTypes } from 'sequelize';
import { db } from '../../lib/databases.js';

const Employee = db.auth.define('Employee', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: db.auth.literal('gen_random_uuid()')
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING
  },
  hire_date: {
    type: DataTypes.DATEONLY
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true
});

export default Employee;
