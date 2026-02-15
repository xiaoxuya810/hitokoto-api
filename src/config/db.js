const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 2,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30_000,
});

module.exports = pool;
