module.exports = {
  port: process.env.PORT || 5000,
  db: {
    database: process.env.DB_NAME || 'dbname',
    user: process.env.DB_USER || 'dbuser',
    password: process.env.DB_PASS || 'dbpassword',
    host: process.env.DB_HOST || 'url'
  },
  vk: {
    api: process.env.TOKEN || 'unknown'
  }
}
