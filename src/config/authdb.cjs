require('dotenv').config();

module.exports = {
  url: process.env.DB_AUTH_URL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true
    }
  },
  define: {
    underscored: true
  }
};
