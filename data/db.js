// data/db.js
const mysql = require('mysql2');

// Crea un pool di connessioni (gestisce automaticamente apertura/chiusura)
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Keep-alive: evita che Railway o MySQL chiudano la connessione per inattività
setInterval(() => {
  pool.query('SELECT 1', (err) => {
    if (err) console.error('DB keepalive error:', err.code || err.message);
  });
}, 1000 * 60 * 5); // ogni 5 minuti

// Esporta solo il pool
module.exports = pool;
