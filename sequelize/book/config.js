import 'dotenv/config';
export default {
  development: {
    dialect: 'postgres',
    url: process.env.DB_BOOK_URL,
    dialectOptions: { ssl: { require: true } },
    logging: false
  }
};
