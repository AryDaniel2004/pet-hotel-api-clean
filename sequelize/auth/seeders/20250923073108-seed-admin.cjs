'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface) {
    const passwordHash = await bcrypt.hash('Admin123', 10);
    await queryInterface.bulkInsert('users', [{
      email: 'admin@demo.com',
      password: passwordHash,    
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@demo.com' });
  }
};

