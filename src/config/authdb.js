module.exports = {
  username: process.env.AUTHDB_USER || 'tu_usuario',
  password: process.env.AUTHDB_PASSWORD || 'tu_contraseña',
  database: process.env.AUTHDB_NAME || 'authdb',
  host: process.env.AUTHDB_HOST || 'localhost',
  port: process.env.AUTHDB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.AUTHDB_SSL === 'true'
  },
  define: {
    underscored: true
  }
};
